---
description: Translation guidelines for Twenty CRM
alwaysApply: false
---
# Translation Guidelines

## Internationalization (i18n) Overview

### Supported Languages
- English (en) - Primary language
- French (fr) - Secondary language
- German (de) - Planned
- Spanish (es) - Planned
- Additional languages based on community contributions

### i18n Architecture
- Use react-i18next for React components
- Store translations in JSON files
- Implement namespace-based organization
- Support for interpolation and pluralization

## File Structure

### Translation Files
```
src/locales/
├── en/                        # English translations
│   ├── common.json           # Common UI strings
│   ├── auth.json             # Authentication strings
│   ├── dashboard.json        # Dashboard specific
│   ├── forms.json            # Form labels and validation
│   └── errors.json           # Error messages
├── fr/                       # French translations
│   ├── common.json
│   ├── auth.json
│   └── ...
└── index.ts                  # i18n configuration
```

### Translation Keys
- Use nested objects for organization
- Follow consistent naming patterns
- Include context in key names
  ```json
  {
    "auth": {
      "login": {
        "title": "Sign In",
        "email": "Email Address",
        "password": "Password",
        "submit": "Sign In",
        "forgotPassword": "Forgot Password?"
      },
      "register": {
        "title": "Create Account",
        "confirmPassword": "Confirm Password"
      }
    }
  }
  ```

## Translation Implementation

### React Components
- Use useTranslation hook
- Specify namespaces for better organization
- Handle loading states properly
  ```typescript
  // ✅ Correct
  import { useTranslation } from 'react-i18next';

  const LoginForm = () => {
    const { t } = useTranslation('auth');

    return (
      <form>
        <h1>{t('login.title')}</h1>
        <input 
          placeholder={t('login.email')}
          type="email"
        />
        <input 
          placeholder={t('login.password')}
          type="password"
        />
        <button type="submit">
          {t('login.submit')}
        </button>
      </form>
    );
  };
  ```

### Interpolation
- Use interpolation for dynamic content
- Pass variables through t() function
- Keep interpolation simple and readable
  ```typescript
  // ✅ Correct
  const WelcomeMessage = ({ userName }: { userName: string }) => {
    const { t } = useTranslation('common');
    
    return (
      <h1>{t('welcome.message', { name: userName })}</h1>
    );
  };

  // Translation file
  {
    "welcome": {
      "message": "Welcome back, {{name}}!"
    }
  }
  ```

### Pluralization
- Handle singular/plural forms correctly
- Use count-based pluralization
- Support different plural rules per language
  ```typescript
  // ✅ Correct
  const ItemCount = ({ count }: { count: number }) => {
    const { t } = useTranslation('common');
    
    return (
      <span>{t('items.count', { count })}</span>
    );
  };

  // Translation file
  {
    "items": {
      "count_one": "{{count}} item",
      "count_other": "{{count}} items"
    }
  }
  ```

## Translation Management

### Adding New Strings
1. Add English translation first
2. Use descriptive keys that indicate context
3. Include comments for translators when needed
4. Test with long translations to ensure UI flexibility
  ```json
  {
    "user": {
      "profile": {
        // Displayed in user profile header
        "displayName": "Display Name",
        // Used in forms when editing profile
        "editDisplayName": "Edit Display Name",
        // Confirmation message after profile update
        "updateSuccess": "Profile updated successfully"
      }
    }
  }
  ```

### Translation Validation
- Use TypeScript for translation key validation
- Implement automated checks for missing translations
- Validate interpolation parameters
  ```typescript
  // ✅ Correct - Type-safe translations
  type TranslationKey = 
    | 'auth.login.title'
    | 'auth.login.email'
    | 'auth.login.password'
    | 'common.welcome.message';

  const t = (key: TranslationKey, options?: any) => {
    // Translation implementation
  };
  ```

## Best Practices

### Key Naming
- Use descriptive, hierarchical keys
- Avoid abbreviations
- Group related translations
- Keep keys consistent across languages
  ```json
  // ✅ Correct
  {
    "dashboard": {
      "header": {
        "title": "Dashboard",
        "subtitle": "Welcome to your workspace"
      },
      "actions": {
        "createNew": "Create New",
        "refresh": "Refresh Data",
        "export": "Export"
      }
    }
  }

  // ❌ Incorrect
  {
    "dash_title": "Dashboard",
    "newBtn": "New",
    "refreshData": "Refresh"
  }
  ```

### String Guidelines
- Write clear, concise text
- Use consistent terminology
- Consider character limits for UI elements
- Avoid concatenating translated strings
  ```json
  // ✅ Correct
  {
    "user": {
      "status": {
        "online": "Online",
        "offline": "Offline",
        "away": "Away"
      }
    }
  }

  // ❌ Incorrect - Don't concatenate
  {
    "user": {
      "statusPrefix": "User is ",
      "statusOnline": "online"
    }
  }
  ```

### Context Information
- Provide context for translators
- Include character limits when relevant
- Explain when/where text appears
- Note any technical constraints
  ```json
  {
    "button": {
      // Primary action button, max 20 characters
      "save": "Save Changes",
      // Secondary button in modal footer
      "cancel": "Cancel",
      // Destructive action, should sound cautious
      "delete": "Delete Permanently"
    }
  }
  ```

## Workflow

### Development Process
1. Develop features with English translations
2. Use placeholder keys during development
3. Finalize translation keys before feature completion
4. Add translations to all supported languages
5. Test with different language strings

### Translation Updates
1. Create translation tasks for new features
2. Provide context and screenshots to translators
3. Review translations for consistency
4. Test UI with translated strings
5. Update documentation when needed

### Quality Assurance
- Review translations in context
- Test with longest expected translations
- Verify formatting with interpolation
- Check for cultural appropriateness
- Ensure accessibility with screen readers

## Maintenance

### Regular Tasks
- Review and update outdated translations
- Check for unused translation keys
- Maintain consistency across languages
- Update translation documentation
- Monitor for missing translations in new features

### Tools and Automation
- Use automated translation validation
- Implement missing translation detection
- Set up continuous integration checks
- Maintain translation coverage reports
- Use translation management platforms when needed
