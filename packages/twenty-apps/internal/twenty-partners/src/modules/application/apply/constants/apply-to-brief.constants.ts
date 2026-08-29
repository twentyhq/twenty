export const APPLY_TO_BRIEF_FRONT_COMPONENT_ID =
  '54f96b09-3c98-4d3c-815a-3f95a2e42527';
export const APPLY_TO_BRIEF_FUNCTION_ID =
  '38fb146a-abe0-495f-8e20-1ebe99a9926a';
export const APPLY_TO_BRIEF_COMMAND_MENU_ITEM_ID =
  'e4668652-9212-4794-ab07-3514c1d0d829';
export const MIN_PITCH_LENGTH = 100;

// The states an existing row may still receive a pitch in. BACKUP belongs here: it is a
// standing shortlist set before the introduction, which is why the outcome cascade also
// leaves it alone. INTRODUCED, WON and DECLINED are decided.
export const PITCHABLE_STATES = ['APPLIED', 'INVITED', 'BACKUP'] as const;
