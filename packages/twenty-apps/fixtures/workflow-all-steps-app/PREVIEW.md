# All 20 step types

App-owned workflow example. Manual trigger; select a step in the SDK definition to inspect its inputs.

```mermaid
flowchart TD
  START([Manual trigger]) --> FORM
  FORM["FORM<br/>Collect demo inputs"]
  CODE["CODE<br/>Prepare a unique company name"]
  LOGIC_FUNCTION["LOGIC_FUNCTION<br/>Call an exposed app function"]
  CREATE_RECORD["CREATE_RECORD<br/>Create the demo company"]
  UPDATE_RECORD["UPDATE_RECORD<br/>Update the demo company name"]
  UPSERT_RECORD["UPSERT_RECORD<br/>Upsert the same demo company"]
  FIND_RECORDS["FIND_RECORDS<br/>Find the demo company"]
  PICK_RECORD["PICK_RECORD<br/>Pick the demo record"]
  FILTER["FILTER<br/>Require a company name"]
  IF_ELSE["IF_ELSE<br/>Choose external actions"]
  DRAFT_EMAIL["DRAFT_EMAIL<br/>Create an email draft"]
  SEND_EMAIL["SEND_EMAIL<br/>Send a separate email"]
  CREATE_CALENDAR_EVENT["CREATE_CALENDAR_EVENT<br/>Create a calendar event"]
  HTTP_REQUEST["HTTP_REQUEST<br/>Fetch example.com"]
  AI_AGENT["AI_AGENT<br/>Ask the app agent"]
  CLASSIFY["CLASSIFY<br/>Classify the company name"]
  ITERATOR["ITERATOR<br/>Iterate over two items"]
  DELAY["DELAY<br/>Wait inside the loop"]
  DELETE_RECORD["DELETE_RECORD<br/>Delete the created demo company"]
  EMPTY["EMPTY<br/>Finish"]
  FORM --> CODE
  CODE --> LOGIC_FUNCTION
  LOGIC_FUNCTION --> CREATE_RECORD
  CREATE_RECORD --> UPDATE_RECORD
  UPDATE_RECORD --> UPSERT_RECORD
  UPSERT_RECORD --> FIND_RECORDS
  FIND_RECORDS --> PICK_RECORD
  PICK_RECORD --> FILTER
  FILTER --> IF_ELSE
  IF_ELSE -->|yes| DRAFT_EMAIL
  IF_ELSE -->|no| HTTP_REQUEST
  DRAFT_EMAIL --> SEND_EMAIL
  SEND_EMAIL --> CREATE_CALENDAR_EVENT
  CREATE_CALENDAR_EVENT --> AI_AGENT
  HTTP_REQUEST --> AI_AGENT
  AI_AGENT --> CLASSIFY
  CLASSIFY --> ITERATOR
  ITERATOR --> DELETE_RECORD
  ITERATOR -->|loop body| DELAY
  DELAY --> ITERATOR
  DELETE_RECORD --> EMPTY
```

The branch rejoins at AI_AGENT. DELAY is the loop body; DELETE_RECORD runs after the iterator finishes. It targets only the company created earlier in this run.

The email/calendar branch needs configured accounts and inputs. The agent and classification steps need AI configuration. Installation does not execute the workflow.
