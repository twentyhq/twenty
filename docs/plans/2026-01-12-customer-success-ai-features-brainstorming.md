# AI Features for Customer Success Teams - Brainstorming

**Date:** 2026-01-12
**Focus Area:** Customer Success Team Workflows
**Primary Challenge:** Proactive Engagement
**Key Signals:** Relationship signals (champion changes, org restructuring, stakeholder engagement)
**Desired Capabilities:** Auto-engagement + Relationship mapping

---

## Context

Twenty CRM already has a sophisticated AI agent framework including:
- AI Agent execution system with chat interface
- Tool generation for CRUD operations
- Workflow integration
- Token-based billing
- File upload support
- Multi-turn conversations

This provides a strong foundation for implementing Customer Success AI features.

---

## User Story Focus

**Customer Success Teams** need help with **proactive engagement** - specifically:
- Detecting relationship signals (champion changes, stakeholder engagement drops, org restructuring)
- Drafting personalized outreach messages when risks are detected
- Mapping organizational relationships to understand influence and engagement

---

## Key Requirements

### Relationship Signals to Detect
- **Champion changes:** Key contact leaving, role changes, becoming unresponsive
- **Stakeholder engagement levels:** Email reply rates, meeting attendance, product usage
- **Organizational restructuring:** New executives, department changes, reporting structure shifts

### Desired Actions
1. **Auto-drafted outreach messages** - AI generates contextual messages for CS rep approval
2. **Relationship mapping** - Visual org charts showing influence, engagement levels, and communication patterns

---

## Proposed Approaches

### Approach 1: Relationship Graph First, Then Engagement
**Strategy:** Build relationship intelligence foundation, then add automation

**Implementation:**
1. Create relationship mapping system
   - Org chart visualization
   - Engagement scoring per contact
   - Influence tracking
2. Add signal detection
3. Layer on message drafting using relationship context

**Pros:**
- Solid data foundation makes message drafting smarter
- Clear visualization helps CS teams understand accounts
- Can manually act on insights while building automation

**Cons:**
- Longer time to value for CS teams
- Requires complex relationship modeling upfront
- No quick wins for team

---

### Approach 2: Smart Message Drafting First, Add Mapping Later ⭐ **RECOMMENDED**
**Strategy:** Quick wins with message assistance, then deeper intelligence

**Implementation:**
1. AI message drafting for common CS scenarios
   - Champion outreach when engagement drops
   - Re-engagement campaigns
   - Check-in messages based on milestones
   - Use existing email/activity data for context
2. Iterate based on usage patterns
3. Add relationship mapping to enhance context

**Pros:**
- **Immediate utility** for CS teams
- Leverages existing AI agent infrastructure
- Lower initial complexity
- Can learn from real usage before building complex features

**Cons:**
- Early drafts less intelligent without full relationship graph
- May need refinement as relationship data improves

**Why recommended:** Gets tangible value into CS teams' hands quickly while building toward more sophisticated relationship intelligence. Aligns with existing AI agent capabilities in Twenty.

---

### Approach 3: Integrated System - Build Both in Parallel
**Strategy:** Full vision from day one

**Implementation:**
1. Build relationship mapping and message drafting together
2. Relationship graph informs message context
3. Message interactions update relationship graph
4. Unified CS intelligence system

**Pros:**
- Most powerful and coherent system
- Messages have full context immediately
- Relationship map stays current with interactions
- Best long-term architecture

**Cons:**
- Higher initial complexity
- Longer development cycle before launch
- Risk of over-engineering
- Harder to iterate based on real usage

---

## Technical Considerations

### Existing Twenty Infrastructure to Leverage

**AI Agent System:**
- Agent execution with system prompts
- Multi-turn conversations
- Tool integration for CRUD operations
- File upload support

**Data Available:**
- Email threads and message history
- Contact records (People) with job titles, companies
- Company records with employee counts, domains
- Activity timeline showing all record changes
- Task and note associations

**Workflow System:**
- Can trigger AI agent actions in workflows
- Supports conditional logic and iteration
- Email sending capabilities

### New Components Needed

**For Message Drafting:**
- CS-specific agent prompts and personas
- Context gathering from email history + recent activities
- Draft approval workflow UI
- Tone/style customization
- Template library for common scenarios

**For Relationship Mapping:**
- Org chart data model (hierarchy, roles, reporting structure)
- Engagement scoring algorithm
- Relationship strength metrics
- Visual graph rendering (frontend)
- Data extraction from emails (extracting org info)
- Champion identification logic

**For Signal Detection:**
- Engagement tracking (email replies, meeting attendance)
- Anomaly detection (drop-offs, changes in pattern)
- Champion risk scoring
- Alert/notification system
- Configurable thresholds

---

## Data Model Extensions

### Potential New Entities

**OrganizationalRole:**
- Person ID
- Company ID
- Role title
- Department
- Reporting manager (Person ID)
- Start date / End date
- Influence score
- Engagement score

**RelationshipSignal:**
- Type (champion_risk, engagement_drop, org_change)
- Detected date
- Person/Company
- Severity
- Context data
- Status (new, acknowledged, resolved)

**MessageDraft:**
- Signal ID (what triggered it)
- Person/Company target
- Draft content
- Suggested subject
- Context used
- CS rep (actor)
- Status (pending, approved, edited, sent, discarded)

---

## Success Metrics

**For Auto-Engagement:**
- Time saved per CS rep per week
- Draft acceptance rate (approved vs. edited vs. discarded)
- Response rates to AI-drafted messages
- Customer sentiment in replies

**For Relationship Mapping:**
- Accuracy of org chart (% validated by CS reps)
- Champion identification accuracy
- Early warning signal effectiveness (% leading to action)
- Reduction in unexpected churn

---

## Next Steps

1. **Choose approach** - Select from the three proposed approaches
2. **Define MVP scope** - Narrow down to smallest valuable feature set
3. **Technical design** - Detail architecture, data models, and implementation
4. **Prototype** - Build proof of concept with one CS scenario
5. **Iterate** - Gather feedback and expand capabilities

---

## Questions to Resolve

- Which approach should we pursue?
- What's the highest-priority CS scenario to tackle first?
- How should relationship strength/engagement be calculated?
- What approval workflow do CS teams need for AI-drafted messages?
- Should this be a workspace-level feature or per-user configuration?
- How do we handle privacy/compliance for analyzing email content?

---

## Related Existing Features

- AI Agent framework (`/packages/twenty-server/src/engine/metadata-modules/ai/`)
- Workflow automation system
- Email integration (Gmail, Outlook, IMAP)
- Timeline activities (audit trail)
- People and Company entities
- Message threads and participants

---

*This brainstorming session explored AI implementation opportunities for Customer Success teams in Twenty CRM, focusing on proactive engagement through relationship signal detection, auto-drafted messages, and relationship mapping.*
