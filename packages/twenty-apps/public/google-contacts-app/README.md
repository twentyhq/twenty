# Google Contacts

**Your Google contacts and your People list, always in step.**

## ✨ What you get

- **Contacts imported automatically**: every 30 minutes, with your whole address book imported the moment you connect
- **People sent back to Google**: select anyone in the People list and pick **Send to Google Contacts** from the command menu
- **Names, emails, phone numbers, job titles, employers, LinkedIn links** kept in step both ways, plus contact photos on the way in
- **Your own account, not the workspace's**: each member connects their own Google account and syncs only their own contacts
- **Edits in Twenty stick**: the more recent change wins, so a sync never reverts something you just typed

## 💳 Billing

**Free to run**: no per-seat, per-contact or per-sync charge.

## 📌 Heads up

- **Deleting in Google is final.** A contact you delete there is not recreated by a later send, and that person cannot be sent again.
- **People are matched on email.** A Google contact reuses an existing person with the same primary email instead of creating a duplicate. Contacts with neither a name nor an email are skipped.
- **Companies are matched on domain, then name.** A contact's employer is linked to the Company with the same website, falling back to the same name, ignoring case either way. A new Company is created when nothing matches and Google gave a name. A contact with no employer leaves an existing link alone.
- **Sending runs in the background**, so the confirmation means queued, not finished. Large selections keep working after you have moved on.

## Getting started

Open the Google Contacts app in Twenty, click **Add connection**, and complete the Google sign-in. Your contacts start importing right away.

> If you see a notice that Google OAuth is not yet set up by your server administrator, ask your Twenty admin to follow the **Self-hosting setup** below.

---

## Self-hosting setup

This section is for Twenty server admins. If you're on Twenty Cloud, skip this: the OAuth credentials are already configured.

### 1. Create a Google OAuth client

1. Enable the **People API** on a Google Cloud project.
2. Create an **OAuth 2.0 client** of type **Web application**.
3. Set the **Authorized redirect URI** to `<SERVER_URL>/auth/apps/callback` (for local dev: `http://localhost:3000/auth/apps/callback`).
4. Add the `https://www.googleapis.com/auth/contacts` scope to the consent screen. Reading and writing both come from this one scope.

### 2. Wire the credentials into Twenty

1. In **Settings → Applications**, find **Google Contacts**, click into it, and go to the **Application registration** tab (admin-only).
2. Paste your Google **Client ID** into `GOOGLE_CONTACTS_CLIENT_ID` and the **Client Secret** into `GOOGLE_CONTACTS_CLIENT_SECRET`.

Workspace members will now be able to add their own Google Contacts connection.
