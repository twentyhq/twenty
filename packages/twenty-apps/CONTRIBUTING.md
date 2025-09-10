# Contributing to Twenty Apps  (WIP WIP WIP - DO NOT USE)

Thank you for your interest in contributing applications to the Twenty ecosystem! This guide will help you create, test, and submit high-quality applications.

## 🚀 Quick Start

### Prerequisites
- Twenty development environment set up
- Basic understanding of Twenty's architecture

### Create Your First Application

1. **Create Application Directory**
   ```bash
   mkdir packages/twenty-apps/my-awesome-app
   cd packages/twenty-apps/my-awesome-app
   ```

2. **Create Application Manifest**
   ```bash
   cat > twenty-app.json << 'EOF'
   {
     "universalIdentifier": "com.yourcompany.my-awesome-app",
     "label": "My Awesome App",
     "description": "A brief description of what your app does",
     "version": "1.0.0",
     "icon": "⭐",
     "roles": [],
     "objects": [],
     "functions": [],
     "agents": [],
     "views": []
   }
   EOF
   ```

3. **Create Documentation**
   ```bash
   cat > README.md << 'EOF'
   # My Awesome App
   
   Brief description of your application.
   
   ## Features
   - Feature 1
   - Feature 2
   
   ## Installation
   ```bash
   npx nx app:install twenty-server \
     --source "./packages/twenty-apps/my-awesome-app" \
     --workspaceId "your-workspace-id" \
     --sourceType "local"
   ```
   EOF
   ```

4. **Validate Your Application**
   ```bash
   npx nx validate twenty-apps
   ```

5. **Test Installation**
   ```bash
   # Build the server first
   npx nx build twenty-server
   
   # Install your app
   npx nx app:install twenty-server \
     --source "./packages/twenty-apps/my-awesome-app" \
     --workspaceId "your-workspace-id" \
     --sourceType "local" \
     --verbose
   ```

## 📋 Application Structure

### Required Files
- `twenty-app.json` - Application manifest (required)
- `README.md` - Application documentation (required)

### Optional Files
- `DEVELOPMENT.md` - Development guide
- `functions/` - Serverless function source files
- `assets/` - Icons, screenshots, etc.
- `examples/` - Usage examples

### Manifest Schema

Your `twenty-app.json` must follow this structure:

```json
{
  "universalIdentifier": "com.company.app-name",
  "label": "Human Readable Name",
  "description": "Brief description (max 500 chars)",
  "version": "1.0.0",
  "icon": "🚀",
  "repositoryUrl": "https://github.com/user/repo",
  
  "roles": [
    {
      "universalIdentifier": "com.company.app-name.role-name",
      "label": "Role Display Name",
      "description": "What this role can do",
      "permissions": {
        "canReadAllObjectRecords": false,
        "canUpdateAllObjectRecords": false,
        "canAccessAllTools": false,
        "canUpdateAllSettings": false
      }
    }
  ],
  
  "objects": [
    {
      "universalIdentifier": "com.company.app-name.object-name",
      "nameSingular": "objectName",
      "namePlural": "objectNames",
      "labelSingular": "Object Name",
      "labelPlural": "Object Names",
      "description": "What this object represents",
      "icon": "📊",
      "fields": [
        {
          "universalIdentifier": "com.company.app-name.object-name.field-name",
          "name": "fieldName",
          "label": "Field Label",
          "type": "TEXT|NUMBER|CURRENCY|DATE_TIME|SELECT|RELATION",
          "isNullable": true,
          "defaultValue": "optional"
        }
      ]
    }
  ],
  
  "functions": [
    {
      "universalIdentifier": "com.company.app-name.function-name",
      "name": "functionName",
      "description": "What this function does",
      "sourceCode": "export const handler = async (event) => { ... };",
      "runtime": "nodejs22.x",
      "timeoutSeconds": 30
    }
  ],
  
  "agents": [
    {
      "universalIdentifier": "com.company.app-name.agent-name",
      "name": "agentName",
      "label": "Agent Display Name",
      "description": "What this agent helps with",
      "prompt": "You are a helpful assistant that...",
      "modelId": "gpt-4"
    }
  ],
  
  "views": [
    {
      "universalIdentifier": "com.company.app-name.view-name",
      "name": "View Name",
      "objectName": "objectName",
      "type": "TABLE|KANBAN|CALENDAR",
      "icon": "📊",
      "fields": [],
      "filters": [],
      "sorts": []
    }
  ]
}
```

## 🛠️ Development Workflow

### 1. Development Mode
Use development mode for rapid iteration:

```bash
# Using environment variable (recommended)
export TWENTY_API_KEY="20202020-f401-4d8a-a731-64d007c27bad"  # Default dev API key
npx nx app:dev twenty-server \
  --path "./packages/twenty-apps/my-awesome-app" \
  --verbose

# Or using command line parameter
npx nx app:dev twenty-server \
  --path "./packages/twenty-apps/my-awesome-app" \
  --api-key "your-api-key-here" \
  --verbose
```

**Getting an API Key:**
1. Start your Twenty development server
2. Go to Settings → APIs & Webhooks
3. Generate a new API key
4. Use the default seeded key `20202020-f401-4d8a-a731-64d007c27bad` for development

This will:
- Watch for file changes
- Automatically sync updates to Twenty
- Show detailed logs of what's happening

### 2. Testing Your Application

#### Validation
```bash
# Validate manifest structure
npx nx validate twenty-apps

# List all applications
npx nx run twenty-apps:list

# Show application info
npx nx run twenty-apps:info
```

#### Installation Testing
```bash
# Test fresh installation (uses TWENTY_API_KEY environment variable)
npx nx app:install twenty-server \
  --source "./packages/twenty-apps/my-awesome-app" \
  --verbose
```

#### Manual Testing
1. Install your application in a test workspace
2. Verify all objects, roles, and functions are created
3. Test the functionality works as expected
4. Check that views display correctly
5. Test any AI agents respond appropriately

### 3. Common Development Patterns

#### Field Types
- `TEXT` - String values
- `NUMBER` - Numeric values  
- `CURRENCY` - Monetary amounts
- `DATE_TIME` - Timestamps
- `SELECT` - Dropdown options
- `RELATION` - Links to other objects

#### Serverless Functions
```javascript
export const handler = async (event) => {
  // Access event data
  const { recordId, workspaceId } = event;
  
  // Perform your logic
  const result = await processData(recordId);
  
  // Return response
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  };
};
```

#### AI Agent Prompts
```json
{
  "prompt": "You are a helpful assistant for [specific domain]. You can help users with:\n\n1. Specific task 1\n2. Specific task 2\n3. Specific task 3\n\nAlways be professional and provide actionable advice."
}
```

## ✅ Quality Guidelines

### Code Quality
- ✅ Valid JSON in manifest
- ✅ All required fields present
- ✅ Unique universal identifiers
- ✅ Proper field types and constraints
- ✅ Meaningful descriptions

### Documentation Quality
- ✅ Clear README with installation instructions
- ✅ Feature list with descriptions
- ✅ Usage examples
- ✅ Screenshots or demos (if applicable)

### Functionality Quality
- ✅ Application installs without errors
- ✅ All features work as described
- ✅ No conflicts with existing Twenty functionality
- ✅ Proper error handling in functions

### User Experience
- ✅ Intuitive object and field names
- ✅ Helpful descriptions and labels
- ✅ Logical default views and sorts
- ✅ Appropriate icons and visual elements

## 🔍 Review Process

### Self-Review Checklist
Before submitting, ensure:

- [ ] Application validates successfully (`npx nx validate twenty-apps`)
- [ ] Installation works in a clean workspace
- [ ] All features function as documented
- [ ] README is complete and accurate
- [ ] Universal identifiers follow reverse domain notation
- [ ] No hardcoded values or test data
- [ ] Functions handle errors gracefully
- [ ] AI agents provide helpful responses

### Submission Process

1. **Fork the Repository**
   ```bash
   git clone https://github.com/twentyhq/twenty.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-awesome-app
   ```

3. **Commit Your Application**
   ```bash
   git add packages/twenty-apps/my-awesome-app/
   git commit -m "feat: add My Awesome App for [specific use case]"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/my-awesome-app
   # Create pull request on GitHub
   ```

### PR Requirements
Your pull request should include:

- **Clear Title**: "feat: add [App Name] for [use case]"
- **Description**: What the app does and why it's useful
- **Screenshots**: Show the app in action
- **Testing**: Confirm you've tested installation and functionality
- **Documentation**: Link to your app's README

### Review Criteria

Applications are reviewed for:

1. **Functionality** - Does it work as described?
2. **Code Quality** - Is the manifest well-structured?
3. **Documentation** - Is it well-documented?
4. **Uniqueness** - Does it provide unique value?
5. **Compatibility** - Works with current Twenty version?
6. **Security** - No security vulnerabilities?

## 🎯 Application Categories

### Business Applications
- **CRM Extensions** - Sales, marketing, customer service
- **Project Management** - Tasks, resources, timelines
- **Financial** - Invoicing, expenses, reporting
- **HR** - Employee management, recruiting

### Industry-Specific
- **Real Estate** - Properties, leads, transactions
- **Healthcare** - Patients, appointments, records
- **Education** - Students, courses, grades
- **Legal** - Cases, clients, documents

### Utility Applications
- **Data Integration** - Import/export, connectors
- **Automation** - Workflows, triggers, notifications
- **Reporting** - Dashboards, analytics, insights
- **Communication** - Messaging, notifications, alerts

## 🆘 Getting Help

### Resources
- [Twenty Documentation](https://docs.twenty.com)
- [Application Examples](./crm-extension/)
- [Community Discord](https://discord.gg/twenty)

### Common Issues

**"Invalid universal identifier"**
- Use reverse domain notation: `com.company.app-name`
- Ensure uniqueness across your application
- Use lowercase with hyphens

**"Validation failed"**
- Check JSON syntax with `jq . twenty-app.json`
- Ensure all required fields are present
- Verify field types match schema

**"Installation failed"**
- Check workspace ID is correct
- Ensure Twenty server is running
- Verify no conflicting applications

### Support Channels
1. Check existing applications for examples
2. Review validation error messages
3. Ask in Twenty Discord #applications channel
4. Open GitHub issue for bugs

---

**Ready to build amazing applications for Twenty?** Start with our [CRM Extension example](./crm-extension/) to see what's possible, then create your own application to solve real business problems!
