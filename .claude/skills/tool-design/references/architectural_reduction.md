# Architectural Reduction: Production Evidence

This document provides detailed evidence and implementation patterns for the architectural reduction approach to agent tool design.

## Case Study: Text-to-SQL Agent

A production text-to-SQL agent was rebuilt using architectural reduction principles. The original architecture used specialized tools with heavy prompt engineering and careful context management. The reduced architecture used a single bash command execution tool.

### Original Architecture (Many Specialized Tools)

The original system included:
- GetEntityJoins: Find relationships between entities
- LoadCatalog: Load data catalog information
- RecallContext: Retrieve previous context
- LoadEntityDetails: Get entity specifications
- SearchCatalog: Search data catalog
- ClarifyIntent: Clarify user intent
- SearchSchema: Search database schema
- GenerateAnalysisPlan: Create query plan
- FinalizeQueryPlan: Complete query plan
- FinalizeNoData: Handle no-data cases
- JoinPathFinder: Find join paths
- SyntaxValidator: Validate SQL syntax
- FinalizeBuild: Complete query build
- ExecuteSQL: Run SQL queries
- FormatResults: Format query results
- VisualizeData: Create visualizations
- ExplainResults: Explain query results

Each tool solved a specific problem the team anticipated the model would face. The assumption was that the model would get lost in complex schemas, make bad joins, or hallucinate table names.

### Reduced Architecture (Two Primitive Tools)

The reduced system included:
- ExecuteCommand: Run arbitrary bash commands in a sandbox
- ExecuteSQL: Run SQL queries against the database

The agent explores the semantic layer using standard Unix tools:

```python
from vercel_sandbox import Sandbox

sandbox = Sandbox.create()
await sandbox.write_files(semantic_layer_files)

def execute_command(command: str):
    """Execute arbitrary bash command in sandbox."""
    result = sandbox.exec(command)
    return {
        "stdout": result.stdout,
        "stderr": result.stderr,
        "exit_code": result.exit_code
    }
```

The agent now uses `grep`, `cat`, `find`, and `ls` to navigate YAML, Markdown, and JSON files containing dimension definitions, measure calculations, and join relationships.

### Comparative Results

| Metric | Original (17 tools) | Reduced (2 tools) | Change |
|--------|---------------------|-------------------|--------|
| Average execution time | 274.8s | 77.4s | 3.5x faster |
| Success rate | 80% (4/5) | 100% (5/5) | +20% |
| Average token usage | ~102k tokens | ~61k tokens | 37% fewer |
| Average steps | ~12 steps | ~7 steps | 42% fewer |

The worst case in the original architecture: 724 seconds, 100 steps, 145,463 tokens, and a failure. The reduced architecture completed the same query in 141 seconds with 19 steps and 67,483 tokens, successfully.

## Why Reduction Works

### File Systems Are Powerful Abstractions

File systems have 50+ years of refinement. Standard Unix tools like `grep` are well-documented, predictable, and understood by models. Building custom tools for what Unix already solves adds complexity without value.

### Tools Were Constraining Reasoning

The specialized tools were solving problems the model could handle on its own:
- Pre-filtering context the model could navigate
- Constraining options the model could evaluate
- Wrapping interactions in validation logic the model didn't need

Each guardrail became a maintenance burden. Each model update required recalibrating constraints. The team spent more time maintaining scaffolding than improving the agent.

### Good Documentation Replaces Tool Sophistication

The semantic layer was already well-documented:
- Dimension definitions in structured YAML
- Measure calculations with clear naming
- Join relationships in navigable files

The custom tools were summarizing what was already legible. The model needed access to read the documentation directly, not abstractions on top of it.

## Implementation Pattern

### The File System Agent

```python
from ai import ToolLoopAgent, tool
from sandbox import Sandbox

# Create sandboxed environment with your data layer
sandbox = Sandbox.create()
await sandbox.write_files(data_layer_files)

# Single primitive tool
def create_execute_tool(sandbox):
    return tool(
        name="execute_command",
        description="""
        Execute a bash command in the sandbox environment.
        
        Use standard Unix tools to explore and understand the data layer:
        - ls: List directory contents
        - cat: Read file contents
        - grep: Search for patterns
        - find: Locate files
        
        The sandbox contains the semantic layer documentation:
        - /data/entities/*.yaml: Entity definitions
        - /data/measures/*.yaml: Measure calculations  
        - /data/joins/*.yaml: Join relationships
        - /docs/*.md: Additional documentation
        """,
        execute=lambda command: sandbox.exec(command)
    )

# Minimal agent
agent = ToolLoopAgent(
    model="claude-opus-4.5",
    tools={
        "execute_command": create_execute_tool(sandbox),
        "execute_sql": sql_tool,
    }
)
```

### Prerequisites for Success

This pattern works when:

1. **Documentation quality is high**: Files are well-structured, consistently named, and contain clear definitions.

2. **Model capability is sufficient**: The model can reason through complexity without hand-holding.

3. **Safety constraints permit**: The sandbox limits what the agent can access and modify.

4. **Domain is navigable**: The problem space can be explored through file inspection.

### When Not to Use

Reduction fails when:

1. **Data layer is messy**: Legacy naming conventions, undocumented joins, inconsistent structure. The model will produce faster bad queries.

2. **Specialized knowledge is required**: Domain expertise that can't be documented in files.

3. **Safety requires restrictions**: Operations that must be constrained for security or compliance.

4. **Workflows are genuinely complex**: Multi-step processes that benefit from structured orchestration.

## Design Principles

### Addition by Subtraction

The best agents may be the ones with the fewest tools. Every tool is a choice made for the model. Sometimes the model makes better choices when given primitive capabilities rather than constrained workflows.

### Trust Model Reasoning

Modern models can handle complexity. Constraining reasoning because you don't trust the model to reason is often counterproductive. Test what the model can actually do before building guardrails.

### Invest in Context, Not Tooling

The foundation matters more than clever tooling:
- Clear file naming conventions
- Well-structured documentation
- Consistent data organization
- Legible relationship definitions

### Build for Future Models

Models improve faster than tooling can keep up. An architecture optimized for today's model limitations may be over-constrained for tomorrow's model capabilities. Build minimal architectures that benefit from model improvements.

## Evaluation Framework

When considering architectural reduction, evaluate:

1. **Maintenance overhead**: How much time is spent maintaining tools vs. improving outcomes?

2. **Failure analysis**: Are failures caused by model limitations or tool constraints?

3. **Documentation quality**: Could the model navigate your data layer directly if given access?

4. **Constraint necessity**: Are guardrails protecting against real risks or hypothetical concerns?

5. **Model capability**: Has the model improved since tools were designed?

## Conclusion

Architectural reduction is not universally applicable, but the principle challenges a common assumption: that more sophisticated tooling leads to better outcomes. Sometimes the opposite is true. Start with the simplest possible architecture, add complexity only when proven necessary, and continuously question whether tools are enabling or constraining model capabilities.

## References

- Vercel Engineering: "We removed 80% of our agent's tools" (December 2025)
- AI SDK ToolLoopAgent documentation
- Vercel Sandbox documentation





