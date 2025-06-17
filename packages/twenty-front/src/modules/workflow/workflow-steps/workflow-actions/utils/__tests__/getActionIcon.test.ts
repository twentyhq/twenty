import { OTHER_ACTIONS } from '../../constants/OtherActions';
import { RECORD_ACTIONS } from '../../constants/RecordActions';
import { getActionIcon } from '../getActionIcon';

describe('getActionIcon', () => {
  it('should return correct icon for all action types', () => {
    RECORD_ACTIONS.forEach((action) => {
      expect(getActionIcon(action.type)).toBe(action.icon);
    });

    OTHER_ACTIONS.forEach((action) => {
      expect(getActionIcon(action.type)).toBe(action.icon);
    });
  });

  it('should return undefined for unknown action type', () => {
    // @ts-expect-error Testing invalid action type
    expect(getActionIcon('UNKNOWN_ACTION')).toBeUndefined();
  });
});
