# LinkedIn for Twenty

Bring LinkedIn conversations into Twenty. Each workspace member connects their
own LinkedIn account; new messages they send or receive land in Twenty as
message threads on the matching People and Companies, next to their emails.

This first version is read-only: conversations are imported as they happen,
replies are sent from LinkedIn.

## Connecting LinkedIn

1. Install **LinkedIn** from **Settings → Applications**.
2. Open **Settings → Apps preferences → LinkedIn** and click **Add connection**.
3. Sign in to LinkedIn on the page that opens.

Conversations are private to the member who connected them: other members only
see who took part and when. A participant is linked to a Person when the
Person's **LinkedIn** field holds their profile URL.

## Self-hosting setup

LinkedIn accounts are connected through [Unipile](https://www.unipile.com)
(API v2). On Twenty Cloud this is already configured.

1. Create an application on [dashboardv2.unipile.com](https://dashboardv2.unipile.com)
   and an **Account API key** for it.
2. Add a webhook endpoint on that application:
   - URL: `<SERVER_URL>/webhooks/server/67c42401-744a-4cc6-afd8-ba9f5accded3`
   - Events: `message.new`, `account.status.disconnected`, `account.status.errored`
3. In **Settings → Applications → LinkedIn → Application registration**, set
   `UNIPILE_API_KEY` to the API key and `UNIPILE_WEBHOOK_SECRET` to the
   endpoint's signing secret.

The app must be installed on its owner workspace for the webhook URL to answer.

## Code layout

Everything that talks to Unipile lives in `src/unipile`, with no dependency on
the rest of the app, so it can be shared with other Unipile-backed apps.
