# Webmetic Visitor Intelligence

Automatically sync B2B website visitor data into Twenty CRM. Identify anonymous companies visiting your website and track their engagement without forms or manual entry. Every hour, Webmetic enriches your CRM with actionable sales intelligence about who's researching your product before they ever fill out a contact form.

## Features

- 🔄 **Hourly Automatic Sync**: Fetches visitor data every hour via cron trigger
- 🏢 **Company Enrichment**: Creates and updates company records with visitor intelligence
- 📊 **Website Lead Tracking**: Records individual visits with detailed engagement metrics
- 📈 **Engagement Scoring**: Webmetic's proprietary scoring algorithm (0-100) identifies warm leads
- 🎯 **Sales Intelligence**: See which companies are actively researching your product
- 🌍 **Geographic Data**: Captures visitor city and country information
- 🔗 **UTM Parameter Tracking**: Full campaign attribution with utm_source, utm_medium, utm_campaign, utm_term, and utm_content
- 📄 **Page Journey Mapping**: Records complete navigation paths and scroll depth
- ⚡ **Smart Deduplication**: Prevents duplicate records using session-based identification
- 🔐 **Production-Ready**: Built with rate limiting, error handling, and idempotent operations

## Requirements

- `twenty-cli` — `npm install -g twenty-cli`
- A Twenty API key (create one at `https://twenty.com/settings/api-webhooks` and name it **"Webmetic"**)
- A Webmetic account with API access. Sign up at [webmetic.de](https://webmetic.de)
- Node 18+ (for local development)

## Metadata prerequisites

The app automatically creates the `websiteLead` custom object with all required fields on first run. No manual field provisioning is needed.

**Created automatically:**
- `websiteLead` object with 14 custom fields (TEXT, NUMBER, DATE_TIME types)
- Company relation field (Many-to-One from websiteLead to Company)
- All fields are idempotent — safe to re-run without errors

## Quick start

### 1. Deploy the app

```bash
twenty auth login
cd packages/twenty-apps/webmetic
twenty app sync
```

### 2. Configure environment variables

- **First, create a Twenty API key**:
  - Go to **Settings → API & Webhooks → API Keys**
  - Click **+ Create API Key**
  - Name it **"Webmetic"**
  - Copy the generated key
- **Then configure the app**:
  - Open **Settings → Apps → Webmetic Visitor Intelligence → Configuration**
  - Provide values for the required keys:
    - `TWENTY_API_KEY` (required secret; paste the API key you just created)
    - `TWENTY_API_URL` (optional; defaults to `http://localhost:3000` for local dev, set to your production URL)
    - `WEBMETIC_API_KEY` (required secret; get from [app.webmetic.de/?menu=api_details](https://app.webmetic.de/?menu=api_details))
    - `WEBMETIC_DOMAIN` (required; your website domain to track, e.g., `example.com`)
  - Save the configuration

### 3. Test the function

- On the app page, select **Test your function**
- Click **Run**
- You should see a success summary showing companies and leads created
- Check **Settings → Data Model → Website Leads** to verify the custom object was created
- Navigate to **Website Leads** from the sidebar to view synced visitor data

### 4. Automatic hourly sync begins

The cron trigger (`0 * * * *`) runs every hour on the hour, continuously syncing new visitor data.

## How it works

### Data flow

```
Webmetic API ─[hourly]→ sync-visitor-data ─[create/update]→ Twenty CRM
                              │
                              ├─→ Company records (with enrichment data)
                              └─→ Website Lead records (linked to companies)
```

### Sync process

1. **Cron Trigger**: Every hour at :00 (e.g., 1:00, 2:00, 3:00)
2. **Schema Validation**: Ensures `websiteLead` object and all fields exist (creates if missing)
3. **Fetch Visitors**: Queries Webmetic API `/company-sessions` endpoint for last hour
4. **Process Companies**: For each visitor's company:
   - Searches for existing company by domain
   - Creates new company or updates existing with latest data from Webmetic
   - Extracts employee count from ranges (e.g., "11-50" → 50)
5. **Create Website Leads**: For each session:
   - Checks for duplicate (by name: "Company - Date")
   - Creates lead record with engagement metrics
   - Links to company via relation field
6. **Rate Limiting**: 800ms delay between API calls (75 requests/minute max)

### Data captured

**Company enrichment (from Webmetic):**
- Name, domain, address (street, city, postcode, country)
- Employee count (parsed from ranges)
- LinkedIn URL (if available)
- Tagline/short description

**Website Lead tracking:**
- Visit date and session duration
- Page views count and pages visited (full navigation path)
- Traffic source (Direct, or utm_source/utm_medium combination)
- UTM campaign parameters (campaign, term, content)
- Visitor location (city, country)
- Engagement score (Webmetic's 0-100 scoring)
- Average scroll depth percentage
- Total user interaction events (clicks, etc.)

## Configuration reference

| Variable | Required | Description |
|----------|----------|-------------|
| `TWENTY_API_KEY` | ✅ Yes | Your Twenty API key for authentication |
| `TWENTY_API_URL` | ❌ No | Base URL of your Twenty instance (defaults to `http://localhost:3000`) |
| `WEBMETIC_API_KEY` | ✅ Yes | Your Webmetic API key from [app.webmetic.de/?menu=api_details](https://app.webmetic.de/?menu=api_details) |
| `WEBMETIC_DOMAIN` | ✅ Yes | Website domain to track (e.g., `example.com` without protocol) |

## API integration

This app uses multiple Twenty CRM APIs:

**REST API** (data operations):
- `GET /rest/metadata/objects` — Fetch object metadata with fields
- `GET /rest/companies` — Find existing companies by domain
- `POST /rest/companies` — Create new companies
- `PATCH /rest/companies/:id` — Update company data
- `POST /rest/websiteLeads` — Create website lead records

**GraphQL Metadata API** (schema management):
- `createOneObject` mutation — Creates custom objects (if needed)
- `createOneField` mutation — Creates custom fields and relations

## Website Lead object structure

The app creates a custom `websiteLead` object with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `name` | TEXT | Lead identifier (Company Name - Date) |
| `company` | RELATION | Many-to-One relation to Company object |
| `visitDate` | DATE_TIME | When the visit occurred |
| `pageViews` | NUMBER | Number of pages viewed during session |
| `sessionDuration` | NUMBER | Visit length in seconds |
| `trafficSource` | TEXT | Where visitor came from (utm_source/utm_medium or Direct) |
| `pagesVisited` | TEXT | List of page URLs visited (→ separated, max 1000 chars) |
| `utmCampaign` | TEXT | UTM campaign parameter |
| `utmTerm` | TEXT | UTM term parameter (keywords for paid search) |
| `utmContent` | TEXT | UTM content parameter (for A/B testing) |
| `visitorCity` | TEXT | Geographic city of visitor |
| `visitorCountry` | TEXT | Geographic country of visitor |
| `visitCount` | NUMBER | Total number of visits from this company |
| `engagementScore` | NUMBER | Webmetic engagement score (0-100) |
| `averageScrollDepth` | NUMBER | Average scroll percentage (0-100) |
| `totalUserEvents` | NUMBER | Total count of user interactions (clicks, etc.) |

## Troubleshooting

**Issue**: No data syncing after setup
- **Solution**: Run "Test your function" to manually trigger a sync and check logs. Verify your `WEBMETIC_API_KEY` and `WEBMETIC_DOMAIN` are correct.

**Issue**: "Duplicate Domain Name" error
- **Solution**: This occurs if you previously deleted a company. Twenty maintains unique constraints on soft-deleted records. Either restore the company from trash or contact support.

**Issue**: Missing fields on websiteLead object
- **Solution**: The sync function recreates missing fields automatically. Run "Test your function" once to repair the schema.

**Issue**: Empty linkedinLink on companies
- **Solution**: Webmetic doesn't have LinkedIn data for that specific company. The mapping is working correctly; data availability depends on Webmetic's enrichment coverage.

**Issue**: Employee count not matching Webmetic
- **Solution**: Webmetic returns ranges (e.g., "11-50"). The app uses the maximum value (50) to better represent company size.

**Issue**: Test shows "No new visitors in the last hour"
- **Solution**: Normal if you have no traffic in the last 60 minutes. Wait for actual traffic or manually adjust the time range in code for testing.

## Rate limiting and performance

- **Webmetic API**: No pagination used; fetches all visitors from last hour
- **Twenty API**: 800ms delay between requests (75 requests/minute)
- **Processing**: Handles 14+ companies with full enrichment in under 30 seconds
- **Cron schedule**: `0 * * * *` (every hour on the hour)
- **Duplicate prevention**: Checks existing leads by name before creating

## Development

### Local testing

```bash
cd packages/twenty-apps/webmetic
yarn install

# Set up .env file
cp .env.example .env
# Edit .env with your credentials

# Sync to local Twenty instance
npx twenty-cli app sync

# Watch for changes
npx twenty-cli app dev
```

### Manual trigger

Use the Twenty UI test panel or trigger via API:

```bash
curl -X POST http://localhost:3000/functions/sync-visitor-data \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Architecture notes

- **100% programmatic schema**: Fields created via GraphQL Metadata API, not manifests
- **Idempotent operations**: Safe to re-run without duplicates or errors
- **Smart domain matching**: Normalizes domains (strips www, protocols) for matching
- **Error resilience**: Individual company failures don't stop the entire sync
- **Detailed logging**: Returns full execution log in response for debugging

## Contributing

Built with 🍺 and ❤️ in Munich by [Team Webmetic](https://webmetic.de) for Twenty CRM Hacktoberfest 2025.

For issues or questions:
- Webmetic API: [webmetic.de](https://webmetic.de)
- Twenty CRM: [twenty.com/developers](https://twenty.com/developers)

## License

MIT
