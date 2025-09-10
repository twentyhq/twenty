# Twenty Apps (WIP WIP WIP - DO NOT USE)

Welcome to the Twenty Apps collection! This package will contain a curated set of applications to extend Twenty CRM's functionality.


## 🚀 Available Applications

### 📊 CRM Extension Demo
**Location**: `./crm-extension/`  
**Description**: A comprehensive demo showcasing custom objects, roles, serverless functions, and AI agents for sales territory and activity management.

**Features**:
- 🗺️ Sales Territory Management
- 📈 Sales Activity Tracking  
- 🤖 AI Sales Assistant
- ⚡ Automated Performance Calculations
- 👥 Role-based Access Control

## 📦 Installation

### Prerequisites

#### For Local Development (Current)
The Twenty CLI is not yet published to npm. Use it locally from the monorepo:

```bash
# From the twenty monorepo root directory
# Use nx to run CLI commands:
npx nx run twenty-cli:start -- auth login

# All CLI commands follow this pattern:
npx nx run twenty-cli:start -- [command] [options]
```

#### For Published Version (Coming Soon)
```bash
# Once published to npm
npm install -g twenty-cli
twenty auth login
```

### Installing an application
```bash
# Install any application from this package (from monorepo root)
npx nx run twenty-cli:start -- app install \
  --source "./packages/twenty-apps/crm-extension" \
  --type local \
  --workspace-id "your-workspace-id"
```

### Developing an application
```bash
# Navigate to the application directory
cd packages/twenty-apps/crm-extension

# Start development mode with auto-sync (from monorepo root)
npx nx run twenty-cli:start -- app dev \
  --verbose
```

## 🏗️ Application Structure

Each application in this package follows the standard Twenty application structure:

```
app-name/
├── twenty-app.json          # Application manifest
├── README.md               # Application documentation
├── DEVELOPMENT.md          # Development guide (optional)
├── functions/              # Serverless functions (optional)
│   ├── function1.js
│   └── function2.js
└── assets/                 # Static assets (optional)
    ├── icons/
    └── screenshots/
```

## 📋 Application Manifest

Every Twenty application must include a `twenty-app.json` file:

```json
{
  "universalIdentifier": "com.company.app-name",
  "label": "App Display Name",
  "description": "Brief description of the app",
  "version": "1.0.0",
  "icon": "🚀",
  
  "agents": [
    {
      "universalIdentifier": "com.company.app-name.agent-name",
      "name": "agentName",
      "label": "Agent Display Name",
      "description": "What this agent helps with",
      "prompt": "You are a helpful assistant that...",
      "modelId": "gpt-4",
      "responseFormat": {
        "type": "text"
      }
    }
  ]
}
```

> **Note**: Currently, Twenty applications primarily support AI agents. Support for custom objects, roles, functions, and views is planned for future releases.

## 🛠️ Development Workflow

### 1. Create a New Application

```bash
# Create application using the CLI (from monorepo root)
npx nx run twenty-cli:start -- app init my-new-app
cd my-new-app

# Or create manually in the twenty-apps package
mkdir packages/twenty-apps/my-new-app
cd packages/twenty-apps/my-new-app

# Create manifest
cat > twenty-app.json << 'EOF'
{
  "universalIdentifier": "com.mycompany.my-new-app",
  "label": "My New App",
  "description": "Description of my application",
  "version": "1.0.0",
  "icon": "⭐",
  "agents": []
}
EOF
```

### 2. Develop with Live Reload

```bash
# Navigate to your application directory
cd packages/twenty-apps/my-new-app

# Start development mode with file watching (from monorepo root)
npx nx run twenty-cli:start -- app dev \
  --workspace-id "your-workspace-id" \
  --verbose
```

### 3. Test Installation

```bash
# Test installation from local source (from monorepo root)
npx nx run twenty-cli:start -- app install \
  --source "./packages/twenty-apps/my-new-app" \
  --type local \
  --workspace-id "test-workspace-id"
```

## 📚 Application Categories

### 🏢 Business Applications
- **CRM Extensions**: Sales, marketing, customer service enhancements
- **Project Management**: Task tracking, resource management
- **Financial**: Invoicing, expense tracking, reporting

### 🤖 AI-Powered Applications  
- **Customer Support**: Intelligent chatbots and support agents
- **Sales Automation**: Lead qualification and follow-up agents
- **Data Analysis**: AI agents for reporting and insights

### 🎨 Industry-Specific Agents
- **Real Estate**: Property recommendation and client management agents
- **Healthcare**: Patient communication and scheduling assistants
- **Education**: Student support and course guidance agents

## 🤝 Contributing Applications

We welcome contributions! To add your application to this collection:

### 1. Application Requirements
- ✅ Complete `twenty-app.json` manifest
- ✅ Comprehensive README.md
- ✅ Proper universal identifier (reverse domain notation)
- ✅ Tested functionality
- ✅ Clear documentation

### 2. Submission Process
1. Fork the repository
2. Create your application in `packages/twenty-apps/your-app-name/`
3. Test thoroughly using the development workflow
4. Submit a pull request with:
   - Application code and manifest
   - Screenshots/demos
   - Installation and usage instructions

### 3. Review Criteria
- **Functionality**: Does it work as described?
- **Documentation**: Is it well-documented?
- **Code Quality**: Is the manifest well-structured?
- **Uniqueness**: Does it provide unique value?
- **Compatibility**: Works with current Twenty version?

## ⚙️ CLI Configuration

The Twenty CLI supports both global and project-level configuration:

```bash
# Set global configuration (applies to all projects)
twenty config set apiUrl "https://your-twenty-instance.com"
twenty config set workspaceId "your-default-workspace-id"

# Set project-level configuration (applies to current directory)
twenty config set workspaceId "project-specific-workspace-id" --project

# View current configuration
twenty config list
```

Configuration files:
- **Global**: `~/.twenty/config.json`
- **Project**: `.twenty.json` in your project directory

## 🔍 Application Discovery

### Browse Applications
```bash
# List all available applications in this package
ls packages/twenty-apps/

# View application details
cat packages/twenty-apps/crm-extension/twenty-app.json

# List installed applications in your workspace (from monorepo root)
npx nx run twenty-cli:start -- app list --workspace-id "your-workspace-id"
```

### Search by Category
Applications are organized by functionality and industry. Check individual README files for detailed feature lists.

## 🚨 Troubleshooting

### Common Issues

**"Authentication failed"**
- Run `npx nx run twenty-cli:start -- auth login` to authenticate
- Check your API key is valid and not expired
- Verify you have access to the workspace

**"Application not found"**
- Verify the path to your application directory
- Ensure `twenty-app.json` exists and is valid JSON
- Check the file is in the correct location

**"Invalid workspace ID"**
- Check your workspace ID is correct
- Use `npx nx run twenty-cli:start -- config get workspaceId` to see your configured workspace
- Ensure you have access to the workspace

**"Manifest validation failed"**
- Validate your JSON syntax using a JSON validator
- Check all required fields are present (universalIdentifier, label, version)
- Ensure universal identifier follows reverse domain notation (com.company.app)

### Getting Help

1. Check the application's README.md for specific instructions
2. Review the Twenty CLI documentation: `npx nx run twenty-cli:start -- --help`
3. Check Twenty's main documentation
4. Open an issue on GitHub with detailed error messages

## 📄 License

All applications in this package are licensed under AGPL-3.0 unless otherwise specified in individual application directories.

## 🌟 Featured Applications

### 🏆 Most Popular
1. **CRM Extension Demo** - Comprehensive sales management
2. *More applications coming soon!*

### 🆕 Recently Added
1. **CRM Extension Demo** - Initial demo application

---

## 🚀 Getting Started

**Ready to extend Twenty CRM with AI agents?** 

### For Local Development (Current)
1. **Clone the repo**: `git clone https://github.com/twentyhq/twenty.git && cd twenty`
2. **Authenticate**: `npx nx run twenty-cli:start -- auth login`
3. **Explore the demo**: Check out the CRM Extension demo to see what's possible
4. **Create your own**: `npx nx run twenty-cli:start -- app init my-app`

### For Published Version (Coming Soon)
1. **Install the CLI**: `npm install -g twenty-cli`
2. **Authenticate**: `twenty auth login`  
3. **Explore the demo**: Check out the CRM Extension demo
4. **Create your own**: `twenty app init my-app`

Start with the CRM Extension demo to see AI agents in action, then create your own applications to solve your unique business needs!
