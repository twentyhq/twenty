import axios from 'axios';

// Rate limiting helper: delay between API calls to avoid hitting limits
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Ensures the websiteLead object exists. Creates it if missing.
 * Uses GraphQL metadata API.
 */
export async function ensureWebsiteLeadObjectExists(apiKey: string, apiBaseUrl: string): Promise<any> {
  const log = (msg: string) => console.log(`[Object Setup] ${msg}`);

  try {
    // Check if websiteLead object already exists
    const objectsResponse = await axios.get(`${apiBaseUrl}/rest/metadata/objects`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    await sleep(800);

    const objects = objectsResponse.data?.data?.objects || [];
    const existingObject = objects.find((obj: any) => obj.nameSingular === 'websiteLead');

    if (existingObject) {
      log(`✓ websiteLead object already exists (ID: ${existingObject.id})`);
      return existingObject;
    }

    // Object doesn't exist, create it via GraphQL
    log('websiteLead object not found, creating it via GraphQL...');

    const mutation = `
      mutation CreateOneObject($input: CreateOneObjectInput!) {
        createOneObject(input: $input) {
          id
          nameSingular
          namePlural
          labelSingular
          labelPlural
        }
      }
    `;

    const variables = {
      input: {
        object: {
          nameSingular: 'websiteLead',
          namePlural: 'websiteLeads',
          labelSingular: 'Website Lead',
          labelPlural: 'Website Leads',
          description: 'B2B website visitor data from Webmetic',
          icon: 'IconEye'
        }
      }
    };

    const metadataUrl = `${apiBaseUrl}/metadata`;
    const response = await axios.post(metadataUrl, {
      query: mutation,
      variables: variables
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const createdObject = response.data?.data?.createOneObject;
    if (!createdObject) {
      throw new Error('Failed to create websiteLead object - no data returned');
    }

    log(`✓ Created websiteLead object (ID: ${createdObject.id})`);
    await sleep(1000);

    return createdObject;

  } catch (error: any) {
    const errorMsg = error?.response?.data?.errors?.[0]?.message || error.message || '';

    // If object already exists (race condition), fetch and return it
    if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
      log('Object already exists, fetching it...');

      const objectsResponse = await axios.get(`${apiBaseUrl}/rest/metadata/objects`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });

      const existingObject = objectsResponse.data?.data?.objects?.find(
        (obj: any) => obj.nameSingular === 'websiteLead'
      );

      if (existingObject) {
        log(`✓ Found existing websiteLead object (ID: ${existingObject.id})`);
        return existingObject;
      }
    }

    console.error('[Object Setup] Error:', error?.response?.data || error.message);
    throw new Error(`Failed to ensure websiteLead object exists: ${errorMsg}`);
  }
}

/**
 * Ensures the websiteLead object exists with all required fields.
 * Uses GraphQL metadata API for all field creation.
 */
export async function ensureWebsiteLeadFieldsExist(apiKey: string, apiBaseUrl: string): Promise<void> {
  const log = (msg: string) => console.log(`[Field Setup] ${msg}`);

  log('Checking if websiteLead fields exist...');

  try {
    // 1. Fetch all objects using REST API
    const objectsResponse = await axios.get(`${apiBaseUrl}/rest/metadata/objects`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    await sleep(800); // Rate limiting

    const objects = objectsResponse.data?.data?.objects || [];
    const websiteLeadObject = objects.find((obj: any) => obj.nameSingular === 'websiteLead');

    if (!websiteLeadObject) {
      throw new Error(
        'websiteLead object not found after creation. This should not happen.'
      );
    }

    log(`✓ Found websiteLead object (ID: ${websiteLeadObject.id})`);

    // 2. Define all required fields
    const requiredFields = [
      // TEXT fields
      { name: 'trafficSource', type: 'TEXT', label: 'Traffic Source', description: 'Where visitor came from (utm_source/utm_medium or Direct)', icon: 'IconWorld' },
      { name: 'pagesVisited', type: 'TEXT', label: 'Pages Visited', description: 'List of page URLs visited (max 1000 chars)', icon: 'IconFileText' },
      { name: 'utmCampaign', type: 'TEXT', label: 'UTM Campaign', description: 'UTM campaign parameter', icon: 'IconTag' },
      { name: 'utmTerm', type: 'TEXT', label: 'UTM Term', description: 'UTM term parameter (keywords for paid search)', icon: 'IconSearch' },
      { name: 'utmContent', type: 'TEXT', label: 'UTM Content', description: 'UTM content parameter (for A/B testing)', icon: 'IconFileText' },
      { name: 'visitorCity', type: 'TEXT', label: 'Visitor City', description: 'Geographic city of visitor', icon: 'IconMapPin' },
      { name: 'visitorCountry', type: 'TEXT', label: 'Visitor Country', description: 'Geographic country of visitor', icon: 'IconWorld' },

      // NUMBER fields
      { name: 'pageViews', type: 'NUMBER', label: 'Page Views', description: 'Number of pages viewed during session', icon: 'IconEye' },
      { name: 'sessionDuration', type: 'NUMBER', label: 'Session Duration', description: 'Visit length in seconds', icon: 'IconClock' },
      { name: 'visitCount', type: 'NUMBER', label: 'Visit Count', description: 'Total number of visits from this company', icon: 'IconRepeat' },
      { name: 'engagementScore', type: 'NUMBER', label: 'Engagement Score', description: 'Webmetic engagement score (0-100)', icon: 'IconChartBar' },
      { name: 'averageScrollDepth', type: 'NUMBER', label: 'Avg Scroll Depth', description: 'Average scroll percentage (0-100)', icon: 'IconArrowDown' },
      { name: 'totalUserEvents', type: 'NUMBER', label: 'Total User Events', description: 'Total count of user interactions (clicks, etc.)', icon: 'IconClick' },

      // DATE_TIME field
      { name: 'visitDate', type: 'DATE_TIME', label: 'Visit Date', description: 'When the visit occurred', icon: 'IconCalendar' },
    ];

    // 3. Check which fields exist
    const existingFields = websiteLeadObject.fields || [];
    const existingFieldNames = new Set(existingFields.map((f: any) => f.name));
    const missingFields = requiredFields.filter(f => !existingFieldNames.has(f.name));

    if (missingFields.length === 0) {
      log(`✓ All ${requiredFields.length} required fields already exist`);

      // Check if company relation exists
      const companyRelation = existingFields.find((f: any) => f.name === 'company' && f.type === 'RELATION');
      if (!companyRelation) {
        log(`⚠️  Company relation field is missing - will create it`);
        await createCompanyRelation(apiKey, apiBaseUrl, websiteLeadObject.id);
      } else {
        log(`✓ Company relation field exists`);
      }

      return;
    }

    log(`Found ${missingFields.length} missing fields, creating them now...`);

    // 4. Create missing fields using GraphQL API
    const metadataUrl = `${apiBaseUrl}/metadata`;
    const mutation = `
      mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
        createOneField(input: $input) {
          id
          name
          label
          type
        }
      }
    `;

    for (const field of missingFields) {
      try {
        log(`  Creating field: ${field.name} (${field.type})...`);

        const variables = {
          input: {
            field: {
              type: field.type,
              objectMetadataId: websiteLeadObject.id,
              name: field.name,
              label: field.label,
              description: field.description,
              icon: field.icon,
              isNullable: true
            }
          }
        };

        await axios.post(metadataUrl, {
          query: mutation,
          variables: variables
        }, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        log(`  ✓ Created: ${field.name}`);
        await sleep(500); // 500ms delay between field creations

      } catch (error: any) {
        // If field already exists (race condition), that's OK
        const errorMsg = error?.response?.data?.errors?.[0]?.message || error.message || '';
        if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
          log(`  - Field ${field.name} already exists (skipping)`);
        } else {
          throw new Error(`Failed to create field ${field.name}: ${errorMsg}`);
        }
      }
    }

    log(`✓ Created ${missingFields.length} missing fields`);

    // 5. Create company relation if it doesn't exist
    const companyRelation = existingFields.find((f: any) => f.name === 'company' && f.type === 'RELATION');
    if (!companyRelation) {
      await createCompanyRelation(apiKey, apiBaseUrl, websiteLeadObject.id);
    }

    log('✓ Field setup complete - all required fields exist');

  } catch (error: any) {
    console.error('[Field Setup] Error:', error?.response?.data || error.message);
    throw error;
  }
}

/**
 * Creates the company relation field (Many-to-One from WebsiteLead to Company).
 * This creates both the forward relation (websiteLead.company) and the inverse (company.websiteLeads).
 */
async function createCompanyRelation(apiKey: string, apiBaseUrl: string, websiteLeadObjectId: string): Promise<void> {
  const log = (msg: string) => console.log(`[Field Setup] ${msg}`);

  try {
    log('  Creating company relation field (Many-to-One)...');

    // First, fetch the company object ID
    const objectsResponse = await axios.get(`${apiBaseUrl}/rest/metadata/objects`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });

    const companyObject = objectsResponse.data?.data?.objects?.find((obj: any) => obj.nameSingular === 'company');

    if (!companyObject) {
      throw new Error('Company object not found');
    }

    log(`  Found company object (ID: ${companyObject.id})`);

    // Use GraphQL for relation creation (REST API doesn't support relations)
    const mutation = `
      mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
        createOneField(input: $input) {
          id
          name
          label
          type
        }
      }
    `;

    const variables = {
      input: {
        field: {
          name: 'company',
          label: 'Company',
          type: 'RELATION',
          objectMetadataId: websiteLeadObjectId,
          isNullable: true,
          relationCreationPayload: {
            type: 'MANY_TO_ONE',
            targetObjectMetadataId: companyObject.id,
            targetFieldLabel: 'Website Leads',
            targetFieldIcon: 'IconChartBar',
          }
        }
      }
    };

    // GraphQL endpoint is at /metadata (not /rest/metadata)
    const metadataUrl = `${apiBaseUrl}/metadata`;

    await axios.post(metadataUrl, {
      query: mutation,
      variables: variables
    }, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    log(`  ✓ Created company relation (websiteLead.company → Company)`);
    log(`  ✓ Also created inverse relation (Company.websiteLeads → websiteLead[])`);
    await sleep(500);

  } catch (error: any) {
    // If relation already exists, that's OK
    const errorMsg = error?.response?.data?.errors?.[0]?.message || error.message || '';
    if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
      log(`  - Company relation already exists (skipping)`);
    } else {
      throw new Error(`Failed to create company relation: ${errorMsg}`);
    }
  }
}
