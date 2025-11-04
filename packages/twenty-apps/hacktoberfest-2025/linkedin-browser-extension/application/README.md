# Browser Extension Serverless Functions

Serverless functions for the Twenty browser extension. These functions handle API interactions between the browser extension and the Twenty backend.

## Overview

This package contains serverless functions that are deployed to your Twenty workspace. The browser extension calls these functions to create and retrieve records in Twenty CRM.

## Functions

### Create Person
**Endpoint:** `/s/create/person`

Creates a new person record in Twenty from LinkedIn profile data.

**Parameters:**
- `firstName` (string) - Person's first name
- `lastName` (string) - Person's last name

**Response:** Created person object

### Create Company
**Endpoint:** `/s/create/company`

Creates a new company record in Twenty from LinkedIn company profile data.

**Parameters:**
- `name` (string) - Company name

**Response:** Created company object

### Get Person
**Endpoint:** `/s/get/person`

Retrieves an existing person record from Twenty (placeholder implementation).

### Get Company
**Endpoint:** `/s/get/company`

Retrieves an existing company record from Twenty (placeholder implementation).

## Setup

### Prerequisites

- **Twenty CLI** installed globally:
  ```bash
  npm install -g twenty-cli
  ```
- **API Key** from your Twenty workspace:
  - Go to https://twenty.com/settings/api-webhooks
  - Generate an API key

### Configuration

1. **Authenticate with Twenty CLI:**
   ```bash
   twenty auth login
   ```

2. **Sync serverless functions to your workspace:**
   ```bash
   twenty app sync
   ```

3. **Configure environment variables:**
   - `TWENTY_API_URL` - Your Twenty API URL (e.g., `https://your-workspace.twenty.com`)
   - `TWENTY_API_KEY` - Your Twenty API key (marked as secret)

Environment variables can be configured via the Twenty CLI or the Twenty web interface after syncing.

## How It Works

1. The browser extension extracts data from LinkedIn profiles
2. The extension calls the serverless functions via the background script
3. Serverless functions authenticate with your Twenty API using the configured API key
4. Functions create or retrieve records in your Twenty workspace
5. Response is sent back to the extension for user feedback

## File Structure

```
serverlessFunctions/
├── create-person/
│   ├── serverlessFunction.manifest.jsonc  # Function configuration
│   └── src/
│       └── index.ts                        # Function implementation
├── create-company/
│   ├── serverlessFunction.manifest.jsonc
│   └── src/
│       └── index.ts
├── get-person/
│   ├── serverlessFunction.manifest.jsonc
│   └── src/
│       └── index.ts
└── get-company/
    ├── serverlessFunction.manifest.jsonc
    └── src/
        └── index.ts
```

## Development

These functions are managed by the Twenty CLI and are deployed to your workspace. After making changes:

1. Update the function code in `src/index.ts`
2. Run `twenty app sync` to deploy changes to your workspace
3. Test the functions via the browser extension or Twenty API directly

## Related Packages

- **`twenty-browser-extension`** - The main browser extension that calls these functions
- See `packages/twenty-browser-extension/README.md` for the complete extension documentation
