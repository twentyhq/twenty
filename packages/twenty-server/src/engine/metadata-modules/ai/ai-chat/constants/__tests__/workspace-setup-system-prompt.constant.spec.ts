import { WORKSPACE_SETUP_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-system-prompt.constant';

describe('WORKSPACE_SETUP_SYSTEM_PROMPT', () => {
  const prompt = WORKSPACE_SETUP_SYSTEM_PROMPT;

  it('should stay static with all dynamic content in the first message', () => {
    expect(prompt).not.toContain('${');
    expect(prompt).not.toContain('The user locale is');
    expect(prompt).not.toContain('Domain:');
  });

  it('should state the two-call reply contract up front', () => {
    expect(prompt).toContain(
      'While the setup runs, every reply of yours ends with one of two tool calls, ask_questions or complete_workspace_setup, as the final section below spells out',
    );
  });

  it('should frame the first message as hidden company context', () => {
    expect(prompt).toContain(
      'kicking off the setup of this brand-new workspace',
    );
    expect(prompt).toContain(
      'The first message of this conversation is not from the user',
    );
    expect(prompt).toContain('the person setting it up');
    expect(prompt).toContain('what you know about them and their company');
    expect(prompt).toContain('invisible');
    expect(prompt).toContain('follow these rules silently');
    expect(prompt).not.toContain('already loaded');
  });

  it('should absorb the skill-then-tools working loop from the base prompt', () => {
    expect(prompt).toContain('load the relevant skill first with load_skills');
    expect(prompt).toContain('learn_tools to discover the tool schemas');
    expect(prompt).toContain(
      'Never call a specialized tool without loading its matching skill first',
    );
    expect(prompt).toContain('still need learn_tools before execute_tool');
    expect(prompt).toContain('Skills are documentation');
  });

  it('should absorb the database, batching, and retry rules from the base prompt', () => {
    expect(prompt).toContain('never guess or construct API URLs');
    expect(prompt).toContain(
      'http_request is only for external third-party APIs',
    );
    expect(prompt).toContain('upsert_many_*');
    expect(prompt).toContain('every record returned consumes context');
    expect(prompt).toContain('instead of looping single-item calls');
    expect(prompt).toContain('try again rather than giving up');
    expect(prompt).toContain(
      'never create another navigation item for an object you just made',
    );
  });

  it('should drop the base rules that fight the setup flow', () => {
    expect(prompt).not.toContain(
      'trivial choices that have an obvious default',
    );
    expect(prompt).not.toContain(
      'the general guidance about skipping questions with obvious defaults',
    );
    expect(prompt).not.toContain('browsing_context');
  });

  it('should instruct a text-first first reply with the mandatory ask_questions call', () => {
    expect(prompt).toContain('required ask_questions call');
    expect(prompt).toContain(
      'reply is unfinished until the ask_questions call is made',
    );
    expect(prompt).toContain('needs no skill and no learn_tools step');
    expect(prompt).toContain(
      'do not call load_skills, learn_tools, execute_tool, or web search',
    );
    expect(prompt).toContain('never give that question a title of its own');
  });

  it('should branch the first reply on what the first message contains', () => {
    expect(prompt).toContain('Do not greet them again');
    expect(prompt).toContain('When the first message describes their company');
    expect(prompt).toContain('tailored to their business');
    expect(prompt).toContain('when their job title is in your user context');
    expect(prompt).toContain('when it is missing, do not guess it');
    expect(prompt).toContain(
      'the two most widely used when you know nothing about them',
    );
    expect(prompt).toContain('what they want to use Twenty for');
  });

  it('should fold at most one person detail into the framing without reciting it', () => {
    expect(prompt).toContain('When the first message carries person context');
    expect(prompt).toContain('fold at most one specific detail');
    expect(prompt).toContain('never recite their profile back at them');
  });

  it('should open with the migration-or-scratch question as a tool call', () => {
    expect(prompt).toContain('moving over from another CRM or starting fresh');
    expect(prompt).toContain(
      'Then stop writing and make the ask_questions call',
    );
    expect(prompt).toContain('leaving any other CRM to the free-text answer');
    expect(prompt).toContain('follow the migration path below');
  });

  it('should request the CRM export in plain text so the upload composer stays available', () => {
    expect(prompt).toContain('end that reply without calling ask_questions');
    expect(prompt).toContain('cannot take attachments');
    expect(prompt).toContain('upload all their CSV exports at once');
    expect(prompt).toContain('as separate files');
    expect(prompt).toContain('spreadsheet their CRM produces');
    expect(prompt).toContain('continue as if they had chosen to start fresh');
  });

  it('should inspect uploaded exports through code_interpreter before proposing the model', () => {
    expect(prompt).toContain('code_interpreter');
    expect(prompt).toContain('read them right away');
    expect(prompt).toContain('headers and a few sample rows');
    expect(prompt).toContain('grounded in what they actually have');
  });

  it('should import migrated rows with the Bulk Import recipe right after the model is built', () => {
    expect(prompt).toContain('data-manipulation');
    expect(prompt).toContain('Bulk Import recipe');
    expect(prompt).toContain('as soon as the model is built');
    expect(prompt).toContain('so one approval covers both');
  });

  it('should anchor the proposal on admission tests instead of numeric bands', () => {
    expect(prompt).toContain('filter, sort, or report on it');
    expect(prompt).toContain('own lifecycle');
    expect(prompt).toContain('not a demo');
    expect(prompt).not.toContain('2 to 4 custom objects');
    expect(prompt).not.toContain('3 to 6 key fields');
    expect(prompt).not.toContain('under 250 words');
  });

  it('should ask about the data model with the ask_questions tool', () => {
    expect(prompt).toContain('Never stop after presenting the proposal');
    expect(prompt).toContain(
      'The turn is unfinished until you call ask_questions asking whether to go ahead and build it',
    );
    expect(prompt).toContain('Ask it even though the answer seems obvious');
  });

  it('should require explicit approval before building and name the metadata tools', () => {
    expect(prompt).toContain('Only propose until the user explicitly approves');
    expect(prompt).toContain(
      'never create, update, or delete anything before approval',
    );
    expect(prompt).toContain('metadata-building');
    expect(prompt).toContain('create_many_object_metadata');
    expect(prompt).toContain('create_many_field_metadata');
    expect(prompt).toContain('create_many_relation_fields');
    expect(prompt).toContain('never set isNullable false');
  });

  it('should not instruct any view work since new fields are visible by default', () => {
    expect(prompt).toContain('New fields land visible on their object');
    expect(prompt).not.toContain('view-building');
    expect(prompt).not.toContain('get_view_fields');
    expect(prompt).not.toContain('navigate_app');
  });

  it('should route what comes next through a mandatory ask_questions call', () => {
    expect(prompt).toContain('## What comes next');
    expect(prompt).toContain(
      'Never stop after that report: the turn is unfinished until you call ask_questions letting them pick what comes next',
    );
    expect(prompt).not.toContain('Nothing after that is a fixed sequence');
    expect(prompt).not.toContain('which single capability to propose next');
  });

  it('should offer the remaining capabilities plus finishing the setup, never recommending the finish', () => {
    expect(prompt).toContain(
      'one line to each capability they do not have yet',
    );
    expect(prompt).toContain('naming the thing in their business it improves');
    expect(prompt).toContain(
      'exactly the capabilities they do not have yet plus finishing the setup',
    );
    expect(prompt).toContain('never the finishing one');
    expect(prompt).toContain('they are not a menu to restate as choices');
  });

  it('should repeat the same question after every build and skip it once nothing is left', () => {
    expect(prompt).toContain(
      'then report it and ask again the same way with what is left',
    );
    expect(prompt).toContain('each round is shorter than the last');
    expect(prompt).toContain('Once nothing is left to offer, skip it');
    expect(prompt).toContain('a question with one option is rejected');
  });

  it('should treat the pick as the approval and never confirm it', () => {
    expect(prompt).toContain('Their pick is the approval');
    expect(prompt).toContain('build it without asking again');
    expect(prompt).toContain(
      'when they pick finishing it, without asking them to confirm',
    );
    expect(prompt).toContain(
      'When they answer in free text instead, do what they asked, then come back to the question',
    );
  });

  it('should propose workflows, dashboards, and roles with their tools', () => {
    expect(prompt).toContain('workflow-building');
    expect(prompt).toContain('create_complete_workflow');
    expect(prompt).toContain('validate_workflow');
    expect(prompt).toContain('dashboard-building');
    expect(prompt).toContain('create_complete_dashboard');
    expect(prompt).toContain('widgetErrors');
    expect(prompt).toContain('roles skill');
    expect(prompt).toContain('list_roles');
    expect(prompt).toContain('Settings > Members > Roles');
  });

  it('should end the setup with a written close followed by the completion call', () => {
    expect(prompt).toContain('## Ending the setup');
    expect(prompt).toContain(
      'The setup ends the moment they are done, whether they tell you so in their own words or pick the finishing option',
    );
    expect(prompt).toContain('Ask nothing more once that happens');
    expect(prompt).toContain('That last reply has two parts, in this order');
    expect(prompt).toContain(
      'Only then, as the last thing in the reply, you call complete_workspace_setup',
    );
    expect(prompt).toContain('never as the only content of a reply');
    expect(prompt).toContain('moving to a side panel');
    expect(prompt).toContain('never twice');
  });

  it('should close without pitching what they did not pick', () => {
    expect(prompt).toContain('a short recap of what was built');
    expect(prompt).toContain('still there whenever they want it');
    expect(prompt).toContain('without pitching it again');
    expect(prompt).not.toContain(
      'never close while they are still unaware of the rest',
    );
    expect(prompt).not.toContain('offer to set one up');
  });

  it('should teach each capability where it comes up', () => {
    expect(prompt).toContain('one plain sentence');
    expect(prompt).toContain('before proposing anything that uses it');
    expect(prompt).toContain('fully customizable');
    expect(prompt).toContain('Settings > Data model');
    expect(prompt).toContain('sidebar under Workflows');
    expect(prompt).toContain('sidebar under Dashboards');
  });

  it('should require a title per reply and chips for objects', () => {
    expect(prompt).toContain('Open each reply with a short plain title');
    expect(prompt).toContain('title each new step');
    expect(prompt).toContain('Write objects as chips');
  });

  it('should carry the ask_questions shape rules the base prompt no longer provides', () => {
    expect(prompt).toContain('Route decisions through ask_questions');
    expect(prompt).toContain(
      'a question mark in your text means the call is missing',
    );
    expect(prompt).toContain(
      'never ask it for information you can look up with a tool',
    );
    expect(prompt).toContain(
      'a short header, its question, and 2 to 4 short options',
    );
    expect(prompt).toContain('each a label with an optional description');
    expect(prompt).toContain('at most one of them marked recommended');
    expect(prompt).toContain('never spell the options out in your text');
  });

  it('should require English names with labels in the user language', () => {
    expect(prompt).toContain('names must be in English');
    expect(prompt).toContain("must be in the user's language");
  });

  it('should end every setup reply on one of the two calls, after its text', () => {
    expect(prompt).toContain('## How every reply ends');
    expect(prompt).toContain(
      'ends in exactly one of two ways: the ask_questions call, or the complete_workspace_setup call',
    );
    expect(prompt).toContain('The only exception is the CSV upload request');
    expect(prompt).toContain(
      'come after the text of that reply, never instead of it',
    );
    expect(prompt).toContain(
      'while anything is still worth building, it is the ask_questions call',
    );
    expect(prompt).toContain(
      'whether they picked the finishing option or told you so in their own words, it is complete_workspace_setup',
    );
  });
});
