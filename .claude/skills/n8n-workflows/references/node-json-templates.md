# n8n Node JSON Templates

Copy-paste ready node configurations for building n8n workflows programmatically.

---

## Triggers

### Webhook (POST with Response Node)

```json
{
  "id": "webhook-1",
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "position": [250, 350],
  "parameters": {
    "path": "your-endpoint",
    "httpMethod": "POST",
    "responseMode": "responseNode",
    "options": {
      "responseData": "allEntries"
    }
  }
}
```

### Schedule Trigger (Hourly)

```json
{
  "id": "schedule-1",
  "name": "Every Hour",
  "type": "n8n-nodes-base.scheduleTrigger",
  "position": [250, 350],
  "parameters": {
    "rule": {
      "interval": [
        {
          "field": "hours",
          "hoursInterval": 1
        }
      ]
    }
  }
}
```

### Error Trigger

```json
{
  "id": "error-trigger-1",
  "name": "Error Trigger",
  "type": "n8n-nodes-base.errorTrigger",
  "position": [250, 500],
  "parameters": {}
}
```

---

## HTTP/API

### HTTP Request (POST with JSON)

```json
{
  "id": "http-post-1",
  "name": "Send Data",
  "type": "n8n-nodes-base.httpRequest",
  "position": [450, 350],
  "parameters": {
    "url": "https://api.example.com/submit",
    "method": "POST",
    "authentication": "none",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify($json) }}",
    "options": {}
  }
}
```

---

## Logic

### IF Node

```json
{
  "id": "if-1",
  "name": "Check Status",
  "type": "n8n-nodes-base.if",
  "position": [450, 350],
  "parameters": {
    "conditions": {
      "boolean": [
        {
          "value1": "={{ $json.status }}",
          "value2": "active"
        }
      ]
    }
  }
}
```

---

## Data

### Set Node

```json
{
  "id": "set-1",
  "name": "Transform Data",
  "type": "n8n-nodes-base.set",
  "position": [450, 350],
  "parameters": {
    "mode": "manual",
    "duplicateItem": false,
    "assignments": {
      "assignments": [
        {
          "id": "assign-1",
          "name": "formatted_name",
          "value": "={{ $json.firstName }} {{ $json.lastName }}",
          "type": "string"
        }
      ]
    }
  }
}
```

### Code Node (Run Once For All)

```json
{
  "id": "code-all-1",
  "name": "Batch Process",
  "type": "n8n-nodes-base.code",
  "position": [450, 350],
  "parameters": {
    "mode": "runOnceForAllItems",
    "jsCode": "const items = $input.all();\nconst results = items.map(item => ({\n  json: { original: item.json.name, upper: item.json.name.toUpperCase() }\n}));\nreturn results;"
  }
}
```

### Respond to Webhook

```json
{
  "id": "respond-1",
  "name": "Send Response",
  "type": "n8n-nodes-base.respondToWebhook",
  "position": [850, 350],
  "parameters": {
    "respondWith": "allIncomingItems",
    "options": {}
  }
}
```

---

## AI/LangChain

### AI Agent

```json
{
  "id": "agent-1",
  "name": "AI Agent",
  "type": "@n8n/n8n-nodes-langchain.agent",
  "position": [450, 350],
  "parameters": {
    "promptType": "auto",
    "systemMessage": "You are a helpful assistant."
  }
}
```

### Chat Model (OpenAI)

```json
{
  "id": "chat-model-1",
  "name": "OpenAI GPT-4",
  "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
  "position": [450, 500],
  "parameters": {
    "model": "gpt-4o",
    "options": {
      "temperature": 0.7,
      "maxTokens": 2000
    }
  },
  "credentials": {
    "openAiApi": {
      "id": "openai-cred-id",
      "name": "openai_api"
    }
  }
}
```

### Memory Buffer

```json
{
  "id": "memory-1",
  "name": "Conversation Memory",
  "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
  "position": [450, 600],
  "parameters": {
    "sessionKey": "={{ $json.sessionId }}",
    "contextWindowLength": 10
  }
}
```

---

## Sticky Notes

### Header Sticky (Green)

```json
{
  "id": "sticky-header",
  "name": "Workflow Info",
  "type": "n8n-nodes-base.stickyNote",
  "position": [0, 0],
  "parameters": {
    "width": 400,
    "height": 350,
    "color": 4,
    "content": "## workflow-name\n\n**Version:** 1.0.0\n**Created:** YYYY-MM-DD\n**Owner:** Name\n**Domain:** domain\n\n### Purpose\nDescription\n\n### Trigger\n- Type: type\n- Path: path\n\n### Credentials\n- `cred_name`"
  }
}
```

---

## Connections

### Basic Connection

```json
"connections": {
  "Source Node Name": {
    "main": [
      [
        {
          "node": "Target Node Name",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
}
```

### IF Branches (True/False)

```json
"connections": {
  "IF Node": {
    "main": [
      [
        {
          "node": "True Branch",
          "type": "main",
          "index": 0
        }
      ],
      [
        {
          "node": "False Branch",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
}
```

### AI Agent Sub-nodes

```json
"connections": {
  "OpenAI GPT-4": {
    "ai_languageModel": [
      [
        {
          "node": "AI Agent",
          "type": "ai_languageModel",
          "index": 0
        }
      ]
    ]
  },
  "Memory": {
    "ai_memory": [
      [
        {
          "node": "AI Agent",
          "type": "ai_memory",
          "index": 0
        }
      ]
    ]
  }
}
```
