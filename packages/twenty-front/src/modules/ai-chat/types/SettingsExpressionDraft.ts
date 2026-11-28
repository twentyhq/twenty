export type SettingsExpressionDraftKind =
  | 'validationRule'
  | 'formula'
  | 'agentTriggerCondition';

export type SettingsExpressionDraft = {
  kind: SettingsExpressionDraftKind;
  expression: string;
};
