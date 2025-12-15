import axios from 'axios';
import { type WebmeticResponse } from './types';
import {
  ensureWebsiteLeadObjectExists,
  ensureWebsiteLeadFieldsExist,
} from './schemaSetup';
import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

// Rate limiting helper: delay between API calls to avoid hitting limits
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const RATE_LIMIT_DELAY = 800;

export const main = async (): Promise<object> => {
  // Capture logs to return in response (create early so we can log everything)
  const logs: string[] = [];
  const log = (message: string) => {
    console.log(message);
    logs.push(message);
  };

  // Debug: Log all available environment variables
  log(
    'Available environment variables: ' +
      Object.keys(process.env)
        .filter((k) => k.includes('TWENTY') || k.includes('WEBMETIC'))
        .join(', '),
  );

  const WEBMETIC_API_KEY = process.env.WEBMETIC_API_KEY;
  const WEBMETIC_DOMAIN = process.env.WEBMETIC_DOMAIN;
  const TWENTY_API_KEY = process.env.TWENTY_API_KEY;

  // Base URL without /rest for metadata operations
  const TWENTY_API_BASE_URL =
    process.env.TWENTY_API_URL !== '' &&
    process.env.TWENTY_API_URL !== undefined
      ? process.env.TWENTY_API_URL
      : 'http://localhost:3000';

  // REST URL for data operations
  const TWENTY_API_URL = `${TWENTY_API_BASE_URL}/rest`;

  log('WEBMETIC_API_KEY: ' + (WEBMETIC_API_KEY ? '***SET***' : 'MISSING'));
  log('WEBMETIC_DOMAIN: ' + (WEBMETIC_DOMAIN || 'MISSING'));
  log('TWENTY_API_KEY: ' + (TWENTY_API_KEY ? '***SET***' : 'MISSING'));
  log('TWENTY_API_BASE_URL: ' + TWENTY_API_BASE_URL);
  log('TWENTY_API_URL (REST): ' + TWENTY_API_URL);

  if (!WEBMETIC_API_KEY || !WEBMETIC_DOMAIN || !TWENTY_API_KEY) {
    return {
      success: false,
      error: 'Missing required environment variables',
      WEBMETIC_API_KEY: !!WEBMETIC_API_KEY,
      WEBMETIC_DOMAIN: !!WEBMETIC_DOMAIN,
      TWENTY_API_KEY: !!TWENTY_API_KEY,
      detailedLog: logs.join('\n'),
    };
  }

  // IMPORTANT: Ensure websiteLead object and all required fields exist before syncing data
  // Everything is created programmatically via GraphQL (object + fields + relations)
  log('\n=== Phase 1: Schema Setup ===');
  try {
    // First, ensure the websiteLead object exists (create via GraphQL if missing)
    await ensureWebsiteLeadObjectExists(TWENTY_API_KEY, TWENTY_API_BASE_URL);

    // Then, ensure all fields exist (create via GraphQL if missing)
    await ensureWebsiteLeadFieldsExist(TWENTY_API_KEY, TWENTY_API_BASE_URL);
  } catch (error: any) {
    log('❌ Failed to ensure schema exists: ' + error.message);
    return {
      success: false,
      error: `Field setup failed: ${error.message}`,
      detailedLog: logs.join('\n'),
    };
  }

  try {
    // 1. Fetch visitor data from Webmetic API using company-sessions endpoint
    log('\n=== Phase 2: Data Sync ===');
    log('=== Starting Webmetic Sync ===');
    log(`Fetching visitor data from Webmetic for domain: ${WEBMETIC_DOMAIN}`);
    log('Time range: -1 hour to now');

    // Build API params
    const webmeticParams: any = {
      domain: WEBMETIC_DOMAIN,
      from_date: '-1 hour',
      to_date: 'now',
    };
    log(`📡 Webmetic API request params: ${JSON.stringify(webmeticParams)}`);

    const webmeticResponse = await axios.get<WebmeticResponse>(
      'https://hub.webmetic.de/company-sessions',
      {
        headers: {
          Authorization: WEBMETIC_API_KEY,
        },
        params: webmeticParams,
      },
    );

    log(`✅ Webmetic API responded successfully`);
    log(
      `📦 Webmetic returned ${webmeticResponse.data.result?.length || 0} companies`,
    );

    const companies = webmeticResponse.data.result;

    if (!Array.isArray(companies) || companies.length === 0) {
      log('ℹ️  No new visitors in the last hour');
      return {
        success: true,
        companiesProcessed: 0,
        sessionsProcessed: 0,
        logCount: logs.length,
        detailedLog: logs.join('\n'),
      };
    }

    const totalSessions = companies.reduce(
      (sum, c) => sum + c.sessions.length,
      0,
    );
    log(
      `\n📊 Found ${companies.length} companies with ${totalSessions} total sessions`,
    );
    log('='.repeat(50));

    // 2. Process each company
    const results = {
      success: true,
      companiesProcessed: 0,
      companiesCreated: 0,
      companiesUpdated: 0,
      sessionsProcessed: 0,
      websiteLeadsCreated: 0,
      errors: [] as string[],
    };

    for (const company of companies) {
      try {
        log(
          `\n🏢 Processing: ${company.company_name} (${company.sessions.length} sessions)`,
        );

        // Extract domain from company_url
        const domainMatch = company.company_url?.match(
          /^https?:\/\/(?:www\.)?([^/]+)/,
        );
        const domain = domainMatch ? domainMatch[1] : company.company_url;
        log(`   Domain: ${domain}`);

        // 2a. Find or create Company in Twenty
        let companyId: string;

        // Try to find existing company by domain
        const existingCompaniesOptions = {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${TWENTY_API_KEY}`,
          },
          url: `${TWENTY_API_URL}/companies?filter=domainName.primaryLinkUrl%5Beq%5D%3A%22${encodeURIComponent(domain)}%22`,
        };

        // Enhanced logging for debugging
        log(`   🔍 Searching for existing company...`);
        log(`   📡 API Call: GET ${existingCompaniesOptions.url}`);
        log(`   🔑 Auth header: Bearer ***SET***`);

        const existingCompaniesResponse = await axios(existingCompaniesOptions);
        log(`   ✅ Response status: ${existingCompaniesResponse.status}`);
        log(
          `   📦 Response data structure: ${JSON.stringify(Object.keys(existingCompaniesResponse.data || {}))}`,
        );

        await sleep(RATE_LIMIT_DELAY); // Rate limiting delay

        const existingCompanies =
          existingCompaniesResponse.data?.data?.companies || [];
        log(
          `   Found ${existingCompanies.length} existing companies with this domain`,
        );

        // Build company data with proper validation
        const companyData: any = {
          name: company.company_name,
          domainName: {
            primaryLinkUrl: domain,
            primaryLinkLabel: domain,
          },
        };

        // Only add address if at least one field has a value
        if (
          company.address ||
          company.city ||
          company.postal_code ||
          company.country
        ) {
          companyData.address = {
            addressStreet1: company.address || '',
            addressCity: company.city || '',
            addressPostcode: company.postal_code || '',
            addressCountry: company.country || '',
          };
        }

        // Parse employee count (Webmetic returns ranges like "11-50" or "501-1000")
        // Take the maximum value from the range for better company size representation
        if (company.employee_count) {
          const employeeStr = company.employee_count.trim();
          let employeeCount: number | null = null;

          if (employeeStr.includes('-')) {
            // Parse range like "11-50" - take the maximum value (50)
            const parts = employeeStr.split('-');
            const max = parseInt(parts[1]);
            if (!isNaN(max) && max > 0) {
              employeeCount = max;
            }
          } else {
            // Single number
            employeeCount = parseInt(employeeStr);
          }

          if (employeeCount && !isNaN(employeeCount) && employeeCount > 0) {
            companyData.employees = employeeCount;
          }
        }

        // Add LinkedIn (linkedinLink exists in schema)
        if (company.linkedin) {
          companyData.linkedinLink = {
            primaryLinkUrl: company.linkedin,
            primaryLinkLabel: 'LinkedIn',
          };
        }

        // Note: tagline, companyEmail, companyPhone, and industryClassification fields don't exist in the standard schema
        // If you need these fields, you'll need to create custom fields in Twenty first

        if (existingCompanies && existingCompanies.length > 0) {
          // Company exists - update it
          companyId = existingCompanies[0].id;
          log(`   ✓ Found existing company (ID: ${companyId})`);

          // Don't include domainName in update (it's unique and already set)
          const updateData = { ...companyData };
          delete updateData.domainName;

          const updateOptions = {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${TWENTY_API_KEY}`,
              'Content-Type': 'application/json',
            },
            url: `${TWENTY_API_URL}/companies/${companyId}`,
            data: updateData,
          };
          await axios(updateOptions);
          await sleep(RATE_LIMIT_DELAY); // Rate limiting delay

          results.companiesUpdated++;
          log(`   ✓ Updated company data`);
        } else {
          // Create new company
          log(`   ➕ Creating new company...`);
          const newCompanyOptions = {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${TWENTY_API_KEY}`,
              'Content-Type': 'application/json',
            },
            url: `${TWENTY_API_URL}/companies`,
            data: companyData,
          };
          const newCompanyResponse = await axios(newCompanyOptions);
          await sleep(RATE_LIMIT_DELAY); // Rate limiting delay

          // Extract company ID from REST API response: { data: { createCompany: { id: "..." } } }
          companyId = newCompanyResponse.data?.data?.createCompany?.id;

          if (!companyId) {
            log(
              `   ⚠️  Warning: Could not extract company ID from response. Full response: ${JSON.stringify(newCompanyResponse.data)}`,
            );
          }

          results.companiesCreated++;
          log(`   ✓ Created company (ID: ${companyId})`);
        }

        // 2b. Create WebsiteLead records for each session
        log(`   📝 Processing ${company.sessions.length} session(s)...`);

        if (!company.sessions || company.sessions.length === 0) {
          log(`   ⚠️  No sessions found for this company`);
        }

        for (const session of company.sessions) {
          try {
            log(`      Processing session ${session.session_id}...`);

            // Build traffic source string
            const trafficSource = session.utm_source
              ? `${session.utm_source}${session.utm_medium ? '/' + session.utm_medium : ''}`
              : 'Direct';

            // Extract pages visited (limit length to prevent DB errors)
            const pagesArray = session.user_data.map(
              (ud) => ud.document_location,
            );
            let pagesVisited = pagesArray.join(' → ');

            // Truncate if too long (max ~1000 chars to be safe)
            if (pagesVisited.length > 1000) {
              pagesVisited = pagesVisited.substring(0, 997) + '...';
            }

            // Use Webmetic's lead score
            const engagementScore = company.lead_score || 0;

            // Calculate average scroll depth
            const scrollDepths = session.user_data
              .map((ud) => ud.scroll_depth)
              .filter((sd) => typeof sd === 'number' && !isNaN(sd));
            const averageScrollDepth =
              scrollDepths.length > 0
                ? Math.round(
                    scrollDepths.reduce((sum, sd) => sum + sd, 0) /
                      scrollDepths.length,
                  )
                : 0;

            // Calculate total user events
            const totalUserEvents = session.user_data.reduce(
              (sum, ud) => sum + (ud.user_events_count || 0),
              0,
            );

            // Use session_id as unique identifier (company name available via relation)
            const leadName = session.session_id;

            log(`      Lead name: ${leadName}`);

            // Check if WebsiteLead already exists for this session
            log(`      Checking if lead already exists...`);
            const existingLeadsOptions = {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${TWENTY_API_KEY}`,
              },
              url: `${TWENTY_API_URL}/websiteLeads?filter=name%5Beq%5D%3A%22${encodeURIComponent(leadName)}%22`,
            };
            const existingLeadsResponse = await axios(existingLeadsOptions);
            await sleep(RATE_LIMIT_DELAY); // Rate limiting delay

            const existingLeads =
              existingLeadsResponse.data?.data?.websiteLeads ||
              existingLeadsResponse.data;
            log(`      Found ${existingLeads?.length || 0} existing leads`);

            if (!existingLeads || existingLeads.length === 0) {
              // Create WebsiteLead record only if it doesn't exist
              const leadData: any = {
                name: leadName,
                visitDate: session.timestamp,
                pageViews: session.user_data.length,
                sessionDuration: session.session_duration,
                trafficSource: trafficSource,
                pagesVisited: pagesVisited,
                visitCount: company.sessions.length,
                engagementScore: engagementScore,
              };

              // Add custom fields
              if (averageScrollDepth > 0) {
                leadData.averageScrollDepth = averageScrollDepth;
              }

              if (totalUserEvents > 0) {
                leadData.totalUserEvents = totalUserEvents;
              }

              if (session.utm_campaign) {
                leadData.utmCampaign = session.utm_campaign;
              }

              if (session.utm_term) {
                leadData.utmTerm = session.utm_term;
              }

              if (session.utm_content) {
                leadData.utmContent = session.utm_content;
              }

              if (session.visitor_city) {
                leadData.visitorCity = session.visitor_city;
              }

              if (session.visitor_country) {
                leadData.visitorCountry = session.visitor_country;
              }

              // Link to company if we have the ID
              if (companyId) {
                leadData.companyId = companyId;
              }

              log(
                `      Creating WebsiteLead with data: ${JSON.stringify(leadData)}`,
              );

              const createOptions = {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${TWENTY_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                url: `${TWENTY_API_URL}/websiteLeads`,
                data: leadData,
              };
              const createResponse = await axios(createOptions);
              await sleep(RATE_LIMIT_DELAY); // Rate limiting delay

              log(
                `      WebsiteLead creation response: ${createResponse.status}`,
              );

              results.websiteLeadsCreated++;
              log(`      ✓ Created WebsiteLead: ${leadName}`);
            } else {
              log(`      - WebsiteLead already exists: ${leadName}`);
            }
          } catch (sessionError: any) {
            const errorDetails =
              sessionError?.response?.data ||
              sessionError?.message ||
              'Unknown error';
            const errorMsg = `Error processing WebsiteLead for session ${session.session_id}: ${JSON.stringify(errorDetails, null, 2)}`;
            console.error(errorMsg);
            log(`      ❌ ${errorMsg}`);
          }
        }

        results.companiesProcessed++;
        results.sessionsProcessed += company.sessions.length;
      } catch (error: any) {
        const errorDetails =
          error?.response?.data || error?.message || 'Unknown error';
        const errorMsg = `Error processing company ${company.company_name}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        const detailedError = `${errorMsg} - Details: ${JSON.stringify(errorDetails, null, 2)}`;

        // Enhanced error logging
        console.error(`\n❌ ${detailedError}`);
        log(`\n❌ ${detailedError}`);

        // Log additional diagnostic info
        if (error?.response) {
          log(
            `   🔍 HTTP Status: ${error.response.status} ${error.response.statusText}`,
          );
          log(`   🔍 Request URL: ${error.config?.url || 'Unknown'}`);
          log(
            `   🔍 Request Method: ${error.config?.method?.toUpperCase() || 'Unknown'}`,
          );
          log(
            `   🔍 Auth Header: ${error.config?.headers?.Authorization ? 'Present' : 'MISSING!'}`,
          );
        }

        results.errors.push(
          `${errorMsg} - Details: ${JSON.stringify(errorDetails)}`,
        );
      }
    }

    log('\n' + '='.repeat(50));
    log('✅ Sync Completed Successfully!');
    log('='.repeat(50));
    log(`📊 Summary:`);
    log(`   Companies Processed: ${results.companiesProcessed}`);
    log(`   Companies Created: ${results.companiesCreated}`);
    log(`   Companies Updated: ${results.companiesUpdated}`);
    log(`   Sessions Processed: ${results.sessionsProcessed}`);
    log(`   Website Leads Created: ${results.websiteLeadsCreated}`);
    log(`   Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
      log('\n⚠️  Errors encountered:');
      results.errors.forEach((err, i) => log(`   ${i + 1}. ${err}`));
    }

    log('='.repeat(50) + '\n');

    // Return results with formatted log string for easier viewing
    return {
      ...results,
      logCount: logs.length,
      detailedLog: logs.join('\n'),
    };
  } catch (error) {
    console.error('Fatal error during sync:', error);
    throw error;
  }
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: 'f2d4b8e6-3a1c-4f7e-9b5d-8c3e2a1f6d4b',
  name: 'sync-visitor-data',
  triggers: [
    {
      universalIdentifier: 'c5e9a3b7-2d8f-4c1e-a6b3-9f2e5d8c1a7b',
      type: 'cron',
      pattern: '0 * * * *',
    },
  ],
};
