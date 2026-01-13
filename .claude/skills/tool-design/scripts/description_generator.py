"""
Tool Description Engineering

This module provides utilities for generating and evaluating tool descriptions.
"""

from typing import Dict, List, Any
import re


# Description Templates

TOOL_DESCRIPTION_TEMPLATE = """
## {tool_name}

{detailed_description}

### When to Use
{usage_context}

### Parameters
{parameters_description}

### Returns
{returns_description}

### Errors
{errors_description}
"""

PARAM_TEMPLATE = """
- **{param_name}** ({param_type}{" | required" if required else " | optional"})
  
  {param_description}
  {"Default: " + default if default else ""}
"""


# Example Generation

def generate_tool_description(tool_spec):
    """Generate complete tool description from specification."""
    description = TOOL_DESCRIPTION_TEMPLATE.format(
        tool_name=tool_spec.name,
        detailed_description=tool_spec.description,
        usage_context=generate_usage_context(tool_spec),
        parameters_description=generate_parameters(tool_spec.parameters),
        returns_description=generate_returns(tool_spec.returns),
        errors_description=generate_errors(tool_spec.errors)
    )
    return description


def generate_usage_context(tool_spec):
    """Generate usage context section."""
    contexts = []
    
    for trigger in tool_spec.triggers:
        contexts.append(f"- When {trigger}")
    
    if tool_spec.examples:
        contexts.append("\n**Examples**:\n")
        for example in tool_spec.examples:
            contexts.append(f"- Input: {example.input}")
            contexts.append(f"  Output: {example.tool_call}")
    
    return "\n".join(contexts)


# Description Evaluation

class ToolDescriptionEvaluator:
    def __init__(self):
        self.criteria = [
            "clarity",
            "completeness",
            "accuracy",
            "actionability",
            "consistency"
        ]
    
    def evaluate(self, description: str, tool_spec) -> Dict:
        """Evaluate description against criteria."""
        results = {}
        
        # Check clarity
        results["clarity"] = self._check_clarity(description)
        
        # Check completeness
        results["completeness"] = self._check_completeness(description, tool_spec)
        
        # Check accuracy
        results["accuracy"] = self._check_accuracy(description, tool_spec)
        
        # Check actionability
        results["actionability"] = self._check_actionability(description)
        
        # Check consistency
        results["consistency"] = self._check_consistency(description, tool_spec)
        
        return results
    
    def _check_clarity(self, description: str) -> float:
        """Check description clarity (0-1 score)."""
        # Check for vague language
        vague_terms = ["help", "assist", "thing", "stuff", "handle"]
        vague_count = sum(1 for term in vague_terms if term in description.lower())
        
        # Check for ambiguous references
        ambiguous = ["it", "this", "that"]  # without clear antecedent
        ambiguous_count = sum(1 for term in ambiguous if f" {term} " in description)
        
        # Calculate clarity score
        clarity = 1.0 - (vague_count * 0.1) - (ambiguous_count * 0.05)
        return max(0, clarity)
    
    def _check_completeness(self, description: str, tool_spec) -> float:
        """Check that all required elements are present."""
        required_sections = [
            ("description", r"## " + tool_spec.name),
            ("parameters", r"### Parameters"),
            ("returns", r"### Returns"),
            ("errors", r"### Errors")
        ]
        
        present = sum(1 for _, pattern in required_sections 
                      if re.search(pattern, description))
        
        return present / len(required_sections)


# Error Message Templates

class ErrorMessageGenerator:
    TEMPLATES = {
        "NOT_FOUND": """
        {{
            "error": "{error_code}",
            "message": "{specific_message}",
            "resolution": "{how_to_resolve}",
            "example": "{correct_format}"
        }}
        """,
        
        "INVALID_INPUT": """
        {{
            "error": "{error_code}",
            "message": "Invalid {field}: {received_value}",
            "expected_format": "{expected_format}",
            "resolution": "Provide value matching {expected_format}"
        }}
        """,
        
        "RATE_LIMITED": """
        {{
            "error": "{error_code}",
            "message": "Rate limit exceeded",
            "retry_after": {seconds},
            "resolution": "Wait {seconds} seconds before retrying"
        }}
        """
    }
    
    def generate(self, error_type: str, context: Dict) -> str:
        """Generate error message from template."""
        template = self.TEMPLATES.get(error_type, self.TEMPLATES["INVALID_INPUT"])
        return template.format(**context)


# Tool Schema Generator

class ToolSchemaBuilder:
    def __init__(self, name: str):
        self.name = name
        self.description = ""
        self.detailed_description = ""
        self.parameters = []
        self.returns = None
        self.errors = []
    
    def set_description(self, short: str, detailed: str):
        """Set description sections."""
        self.description = short
        self.detailed_description = detailed
        return self
    
    def add_parameter(self, name: str, param_type: str, description: str,
                      required: bool = False, default=None, enum=None):
        """Add parameter definition."""
        self.parameters.append({
            "name": name,
            "type": param_type,
            "description": description,
            "required": required,
            "default": default,
            "enum": enum
        })
        return self
    
    def set_returns(self, return_type: str, description: str, properties: Dict):
        """Set return value definition."""
        self.returns = {
            "type": return_type,
            "description": description,
            "properties": properties
        }
        return self
    
    def add_error(self, code: str, description: str, resolution: str):
        """Add error definition."""
        self.errors.append({
            "code": code,
            "description": description,
            "resolution": resolution
        })
        return self
    
    def build(self) -> Dict:
        """Build complete schema."""
        return {
            "name": self.name,
            "description": self.description,
            "detailed_description": self.detailed_description,
            "parameters": {
                "type": "object",
                "properties": {
                    p["name"]: {
                        "type": p["type"],
                        "description": p["description"]
                    }
                    for p in self.parameters
                },
                "required": [p["name"] for p in self.parameters if p["required"]]
            },
            "returns": self.returns,
            "errors": self.errors
        }
