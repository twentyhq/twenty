# n8n Expression Syntax Reference

## The Rule

**ALL expressions MUST be wrapped in {{ }}**

## Basic Patterns

| Access Type | Syntax |
|-------------|--------|
| Current item field | `{{ $json.fieldName }}` |
| Nested field | `{{ $json.data.nested }}` |
| Field with dashes | `{{ $json['field-name'] }}` |
| Reference other node | `{{ $('NodeName').item.json.field }}` |
| First item from input | `{{ $input.first().json.field }}` |
| Optional chaining | `{{ $json.data?.nested?.field }}` |

## Critical Mistakes

### Mistake 1: Trailing Period
```javascript
// WRONG
{{ $json.user. }}

// CORRECT
{{ $json.user }}
```

### Mistake 2: Missing JSON Wrapper in Code Node
```javascript
// WRONG
return { processed: true };

// CORRECT
return [{ json: { processed: true } }];
```

### Mistake 3: Wrong Reference for Other Nodes
```javascript
// WRONG - $json only for current node
{{ $json.otherNodeField }}

// CORRECT - Use $() for other nodes
{{ $('Other Node').item.json.field }}
```

### Mistake 4: Missing Curly Braces
```javascript
// WRONG
$json.email

// CORRECT
{{ $json.email }}
```

## Node Reference Patterns
```javascript
// Get data from named node
{{ $('HTTP Request').item.json.data }}

// Get first item
{{ $('HTTP Request').first().json.data }}

// Get all items (returns array)
{{ $('HTTP Request').all() }}
```

## Code Node Patterns

### Run Once Per Item
```javascript
const email = $json.email;
const name = $json.name;
const result = { formatted: `${name} <${email}>` };
return result;  // n8n wraps automatically
```

### Run Once For All Items
```javascript
const items = $input.all();
const processed = items.map(item => ({
  json: { original: item.json.name, upper: item.json.name.toUpperCase() }
}));
return processed;  // MUST return array
```

## Special Variables
```javascript
{{ $execution.id }}      // Execution ID
{{ $execution.mode }}    // 'test' or 'production'
{{ $workflow.id }}       // Workflow ID
{{ $workflow.name }}     // Workflow name
{{ $now }}               // Current DateTime
{{ $today }}             // Today at midnight
{{ $itemIndex }}         // Current item index
```

## Safe Patterns

### Optional Chaining
```javascript
// Prevents null errors
{{ $json.response?.data?.user?.email }}

// With fallback
{{ $json.response?.data?.email ?? 'no-email@example.com' }}
```

### Null Coalescing
```javascript
// Default value if null/undefined
{{ $json.name ?? 'Unknown' }}

// Use ?? not || for numbers (|| fails for 0)
{{ $json.count ?? 0 }}
```

## $fromAI() Function (AI Agent Only)
```javascript
// Works ONLY with tools connected to AI Agent
{{ $fromAI('email', 'Customer email address', 'string') }}

// Parameters:
// 1. key (required): Identifier
// 2. description: Hint for AI
// 3. type: 'string' | 'number' | 'boolean'
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Cannot read property 'x' of undefined | Nested null | Use optional chaining |
| Expression evaluation failed | Syntax error | Remove trailing dots |
| Cannot find node X | Typo in node name | Use exact node name |
| items[0] is undefined | No output | Use optional chain with fallback |

## Cheat Sheet
```javascript
// ALWAYS START WITH
{{ ... }}

// CURRENT NODE DATA
{{ $json.field }}
{{ $json['field-with-dashes'] }}
{{ $json.nested?.field }}

// OTHER NODE DATA
{{ $('Node Name').item.json.field }}
{{ $('Node Name').first().json.field }}

// CODE NODE RETURN
return [{ json: { field: value } }];

// SAFE ACCESS
{{ $json.data?.field ?? 'default' }}
```
