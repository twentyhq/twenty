# Twenty Emails

This package contains the email templates used by Twenty.

## Features

- Email templates built with [React Email](https://react.email/)
- Internationalization (i18n) support via [@lingui/react](https://lingui.dev/)
- Local preview server for testing email templates

## Getting Started

### Starting the Local Preview Server

To start the local preview server for email development:

```bash
npx nx start twenty-emails
```

This will run the development server on port 4001. You can then view your email templates at [http://localhost:4001](http://localhost:4001).

### Building Emails

To build the email templates:

```bash
npx nx build twenty-emails
```

## Email Structure

Each email template is located in the `src/emails` directory. The templates use various components from the `src/components` directory to maintain consistent styling and functionality.
