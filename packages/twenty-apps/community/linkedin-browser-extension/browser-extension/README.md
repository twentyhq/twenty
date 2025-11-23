# Twenty Browser Extension

A Chrome browser extension for capturing LinkedIn profiles (people and companies) directly into Twenty CRM. This is a basic **v0** focused mostly on establishing a solid architectural foundation.

## Overview

This extension integrates with LinkedIn to extract profile information and create records in Twenty CRM. It uses **WXT** as the framework - initially tried Plasmo, but found WXT to be significantly better due to its extensibility and closer alignment with the Chrome extension APIs, providing more control and flexibility.

## Architecture

### Package Structure

The extension consists of two main packages:

1. **`twenty-browser-extension`** - The main extension package (WXT + React)
2. **`twenty-apps/browser-extension`** - Serverless functions for API interactions

### Extension Components

#### Entrypoints

- **Background Script** (`src/entrypoints/background/index.ts`)
  - Handles extension messaging protocol
  - Manages API calls to serverless functions
  - Coordinates communication between content scripts and popup

- **Content Scripts**
  - **`add-person.content`** - Injects UI button on LinkedIn person profiles
  - **`add-company.content`** - Injects UI button on LinkedIn company profiles
  - Both scripts use WXT's `createIntegratedUi` for seamless DOM injection
  - Extract profile data from LinkedIn DOM

- **Popup** (`src/entrypoints/popup/`)
  - React-based popup UI
  - Displays extracted profile information
  - Provides buttons to save person/company to Twenty

#### Messaging System

Uses `@webext-core/messaging` for type-safe communication between extension components:

```typescript
// Defined in src/utils/messaging.ts
- getPersonviaRelay() - Relays extraction from content script
- getCompanyviaRelay() - Relays extraction from content script
- extractPerson() - Extracts person data from LinkedIn DOM
- extractCompany() - Extracts company data from LinkedIn DOM
- createPerson() - Creates person record via serverless function
- createCompany() - Creates company record via serverless function
- openPopup() - Opens extension popup
```

#### Serverless Functions

Located in `packages/twenty-apps/browser-extension/serverlessFunctions/`:

- **`/s/create/person`** - Creates a new person record in Twenty
- **`/s/create/company`** - Creates a new company record in Twenty
- **`/s/get/person`** - Retrieves existing person record (placeholder)
- **`/s/get/company`** - Retrieves existing company record (placeholder)

## Development Guide

### Prerequisites

- Twenty CLI installed globally: `npm install -g twenty-cli`
- API key from Twenty: https://twenty.com/settings/api-webhooks

### Setup
   ```
1. **Configure environment variables:**
   - Set `TWENTY_API_URL` in the serverless function configuration
   - Set `TWENTY_API_KEY` (marked as secret) in the serverless function configuration
   - For local development, create a `.env` file or configure via `wxt.config.ts`

### Development Commands

```bash
# Start development server with hot reload
npx nx run dev twenty-browser-extension

# Build for production
npx nx run build twenty-browser-extension

# Package extension for distribution
npx nx run package twenty-browser-extension
```

### Development Workflow

1. **Start the dev server:**
   ```bash
   npx nx run dev twenty-browser-extension
   ```
   This starts WXT in development mode with hot module reloading.

2. **Load extension in Chrome:**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `packages/twenty-browser-extension/dist/chrome-mv3-dev/`

3. **Test on LinkedIn:**
   - Navigate to a LinkedIn person profile: `https://www.linkedin.com/in/...`
   - Navigate to a LinkedIn company profile: `https://www.linkedin.com/company/...`
   - The "Add to Twenty" button should appear in the profile header
   - Click the button to open the popup and save to Twenty

### Project Structure

```
packages/twenty-browser-extension/
├── src/
│   ├── common/
│   │   └── constants/      # LinkedIn URL patterns
│   ├── entrypoints/
│   │   ├── background/     # Background service worker
│   │   ├── popup/          # Extension popup UI
│   │   ├── add-person.content/  # Content script for person profiles
│   │   └── add-company.content/ # Content script for company profiles
│   ├── ui/                 # Shared UI components and theme
│   └── utils/              # Messaging utilities
├── public/                 # Static assets (icons)
├── wxt.config.ts          # WXT configuration
└── project.json            # Nx project configuration
```

## Current Status (v0)

This is a foundational version focused on architecture. Current features:

✅ Inject UI buttons into LinkedIn profiles
✅ Extract person and company data from LinkedIn
✅ Display extracted data in popup
✅ Create person records in Twenty
✅ Create company records in Twenty

## Planned Features

- [ ] Provide a way to have API key and custom remote URLs.
- [ ] Detect if record already exists and prevent duplicates
- [ ] Open existing Twenty record when clicked (instead of creating duplicate)
- [ ] Sidepanel Overlay UI for rich profile viewing/editing
- [ ] Enhanced data extraction (email, phone, etc.)
- [ ] Better error handling

## Why WXT?

We initially evaluated **Plasmo** but chose **WXT** for several reasons:

1. **Extensibility** - WXT provides more flexibility for custom extension patterns
2. **Chrome API Proximity** - Closer to native Chrome extension APIs, giving more control
3. **Type Safety** - Better TypeScript support for extension messaging
4. **Architecture** - More transparent build process and entrypoint management

## Contributing

This extension is in early development. The architecture is designed to be extensible, but the current implementation is intentionally minimal to establish solid foundations.
