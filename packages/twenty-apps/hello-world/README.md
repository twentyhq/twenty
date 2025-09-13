# Hello World 👋

A delightful Twenty CRM application that welcomes users with a friendly AI assistant!

## 🌟 What it does

This app provides a cheerful AI companion that:
- 🎉 Welcomes new users with enthusiasm
- 🚀 Helps users discover Twenty CRM features  
- 💡 Provides helpful tips and best practices
- 🎯 Guides users through their first steps
- ✨ Makes the CRM experience delightful

## 🤖 Meet Your Friendly Assistant

The **Friendly Assistant** is your personal guide to Twenty CRM! This AI companion is:
- Warm and welcoming to all users
- Encouraging and supportive in every interaction
- Clear and helpful with explanations
- Excited about helping users succeed
- Full of positive energy and emojis! 🌈

## 🚀 Getting Started

### Development Mode

To start developing this app:

```bash
# From the project root
npx nx run twenty-cli:start -- app dev --path packages/twenty-apps/hello-world

# Or from this directory
cd packages/twenty-apps/hello-world
npx nx run twenty-cli:start -- app dev
```

### Deployment

To deploy this app to your Twenty instance:

```bash
npx nx run twenty-cli:start -- app deploy --path packages/twenty-apps/hello-world
```

## 🎨 Customization

Want to make this app even more fun? You can:

1. **Update the greeting style** - Modify the agent's prompt in `twenty-app.json`
2. **Change the personality** - Adjust the tone and approach
3. **Add more features** - Extend the agent's capabilities
4. **Customize the icon** - Pick your favorite emoji for the app and agent

## 💡 Example Interactions

Here's what users can expect from the Friendly Assistant:

> **User**: "I'm new to Twenty CRM, where should I start?"
> 
> **Friendly Assistant**: "🎉 Welcome to Twenty CRM! I'm so excited you're here! Let's get you started on this amazing journey! 
> 
> Here are the perfect first steps:
> 1. 👥 Add your first contacts
> 2. 🏢 Set up your companies  
> 3. 🎯 Create your first opportunities
> 4. 📊 Explore the dashboard to see your data come to life!
> 
> Which one sounds most interesting to you? I'm here to guide you every step of the way! ✨"

## 🛠️ Technical Details

- **Agent Model**: Uses `auto` model selection for optimal performance
- **Response Format**: Plain text with emoji support
- **Universal ID**: `com.twenty.demo.hello-world.friendly-assistant`
- **Integration**: Seamlessly works with Twenty CRM's agent system

## 🌈 Why This App?

This Hello World app demonstrates:
- How to create engaging AI personalities
- Best practices for user onboarding
- The power of positive, helpful AI interactions
- How simple apps can make a big impact on user experience

Perfect for new developers learning Twenty's app system, or as a starting point for more complex applications!

---

*Made with ❤️ for the Twenty community*
