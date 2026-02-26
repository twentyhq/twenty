# Apollo Enrichment App - Design Document

## Overview

This document outlines the design for the Apollo Enrichment Twenty App, which integrates Apollo.io's enrichment capabilities into Twenty CRM.

---

## 1. OAuth Flow

```
┌─────────────────┐     ┌───────────────┐     ┌─────────────────────┐
│ oauth-settings  │ ──► │ get-oauth-url │ ──► │ Apollo OAuth Portal │
│     [front]     │     │   [function]  │     │     [external]      │
└─────────────────┘     └───────────────┘     └──────────┬──────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌───────────────┐     ┌──────────────────────────┐
│    settings     │ ◄── │ store tokens  │ ◄── │ get-oauth-redirect-page  │
│     [front]     │     │   [app var]   │     │        [function]        │
└─────────────────┘     └───────────────┘     └──────────────────────────┘
```

### App Variables

- `APOLLO_OAUTH_CLIENT_ID` - Apollo OAuth client identifier
- `APOLLO_OAUTH_CLIENT_SECRET` - Apollo OAuth client secret
- `APOLLO_OAUTH_URL` - Apollo OAuth base URL

### Logic Functions

#### `get-oauth-url`

- **Trigger**: HTTP endpoint
- **Authentication**: Required
- **Description**: Returns the Apollo OAuth authorization URL

#### `get-oauth-redirect-page`

- **Trigger**: HTTP endpoint
- **Authentication**: Required
- **Description**: Handles the OAuth callback flow
  1. Receives the authorization code from Apollo
  2. Exchanges it for access and refresh tokens by posting to `https://app.apollo.io/api/v1/oauth/token`
  3. Stores the tokens in app variables
  4. Returns an HTML page that redirects to the app settings

### Front Components

#### `oauth-settings`

- **Location**: Rendered in the app settings page
- **Description**: Provides a button/link to initiate the Apollo OAuth flow, enabling navigation to the apollo oauth page (fetched by calling the `get-oauth-url` logic function).

---

## 2. Enrichment Tools

### `Enrich Company with Apollo`

- **Input**: Domain name
- **Apollo Endpoint**: `organization_enrich`
- **Description**: Enriches company records with Apollo data based on their domain

### `Enrich Person with Apollo`

- **Input**: Email address
- **Apollo Endpoint**: `people_match`
- **Description**: Enriches person records with Apollo data based on their email

### Enrichment Requirements

- **Skip duplicate requests**: If a previous enrichment request for the same record was unsuccessful, skip subsequent attempts
- **Response parsing**: Parse the Apollo response payload to return data conforming to Twenty's common API data validation format

---

## 3. Data Model Updates

### Person Object

Create the necessary custom fields to store Apollo enrichment data on the Person object.

### Company Object

Create the necessary custom fields to store Apollo enrichment data on the Company object.

---

## 4. Bonus: Ready-to-Use Implementation

### Front Component: `enrichment-workflow-settings`

- **Location**: Rendered in the app settings page
- **Description**: Enables users to choose a "ready-to-use" implementation

### Behavior

When the user selects this option, it triggers the automatic creation of a workflow containing:

- **Record triggers**: Database event triggers on Person and Company records
- **Apollo tools**: The enrichment tools defined above
- **Record upserts**: Actions to update records with enriched data

This provides a one-click setup for users who want the complete enrichment flow without manual configuration.
