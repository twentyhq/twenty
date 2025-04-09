# Translation Guidelines

## Core Translation Principles
Twenty uses Lingui for internationalization (i18n) and Crowdin for translation management. This document outlines our translation workflow and best practices.

## Technology Stack

### Translation Tools
- **Framework**: @lingui/react
- **Translation Management**: Crowdin
- **Workflow**: GitHub Actions for automation

### Package Structure
Translation files are managed in multiple packages:
- `twenty-front`: Frontend translations
- `twenty-server`: Backend translations
- `twenty-emails`: Email template translations

## Translation Process

### Adding New Strings

#### Using Lingui Macros
- Use `<Trans>` for components
- Use `t` macro for strings outside JSX
  ```typescript
  // ✅ Correct - In JSX
  import { Trans } from '@lingui/react/macro';
  
  const WelcomeMessage = () => (
    <h1>
      <Trans>Welcome to Twenty</Trans>
    </h1>
  );

  // ✅ Correct - Outside JSX
  import { t } from '@lingui/react/macro';
  
  const getMessage = () => {
    return t`Welcome to Twenty`;
  };

  // ❌ Incorrect - Don't use raw strings
  const WelcomeMessage = () => (
    <h1>Welcome to Twenty</h1>
  );
  ```

### String Guidelines

#### What to Translate
- User interface text
- Error messages
- Notifications
- Email content

#### What Not to Translate
- Variables
- Test data/mocks

### Translation Workflow

#### 1. Extracting Translations
- Automatically triggered on main branch changes
- Can be manually triggered in GitHub Actions
- Process:
  ```bash
  # Extract new strings
  nx run twenty-front:lingui:extract
  nx run twenty-server:lingui:extract
  nx run twenty-emails:lingui:extract
  ```

#### 2. Translation Management
- Translations are managed in Crowdin
- Changes are synced every 2 hours
- Process:
  1. New strings are uploaded to Crowdin
  2. Translators work on translations
  3. Translations are pulled back to the repository

#### 3. Compiling Translations
- Happens automatically in CI/CD
- Required before running the application
  ```bash
  # Compile translations
  nx run twenty-front:lingui:compile
  nx run twenty-server:lingui:compile
  nx run twenty-emails:lingui:compile
  ```

## Best Practices

### String Management

#### Use Placeholders
- Use placeholders for dynamic content
  ```typescript
  // ✅ Correct
  <Trans>Hello {userName},</Trans>

  // ❌ Incorrect - String concatenation
  <Trans>Hello </Trans>{userName},
  ```

#### Provide Context
- Lingui provides powerfulway to add context for translators but we don't use them as of today.

### Code Organization

#### Translation Files
- Keep translation files organized by feature
- Use consistent naming patterns
  ```
  src/
  ├── locales/
  │   ├── en/
  │   │   ├── messages.po
  │   │   └── messages.js
  │   └── fr/
  │       ├── messages.po
  │       └── messages.js
  ```

### Quality Assurance

#### Strict Mode
- Use --strict mode when compiling to identify missing translations


#### Testing Translations
- Test with different locales
- Verify string interpolation
- Check layout with different language lengths

## Automation

### GitHub Actions

#### Pull Workflow
- Runs every 2 hours
- Downloads new translations from Crowdin
- Creates PR if changes detected
- Can be manually triggered with force pull option

#### Push Workflow
- Runs on main branch changes
- Extracts and uploads new strings
- Compiles translations
- Creates PR with changes

### Error Handling

#### Missing Translations
- Development: Shown in original language
- Production: Falls back to default language
- Strict mode in CI catches missing translations

#### Compilation Errors
- Addressed before merging
- PR created for fixing missing translations
- Automated testing in CI pipeline 