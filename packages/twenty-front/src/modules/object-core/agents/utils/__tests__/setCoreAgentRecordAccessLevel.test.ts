import { getCoreAgentRecordAccessLevels } from '@/object-core/agents/utils/getCoreAgentRecordAccessLevels';
import { setCoreAgentRecordAccessLevel } from '@/object-core/agents/utils/setCoreAgentRecordAccessLevel';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';

describe('setCoreAgentRecordAccessLevel', () => {
  it('grants see along with edit on one object only', () => {
    const role = setCoreAgentRecordAccessLevel({
      role: DEFAULT_SETTINGS_DRAFT_ROLE,
      level: 'edit',
      isEnabled: true,
      objectMetadataId: 'company',
    });

    expect(
      getCoreAgentRecordAccessLevels({ role, objectMetadataId: 'company' }),
    ).toEqual(['see', 'edit']);
    expect(
      getCoreAgentRecordAccessLevels({ role, objectMetadataId: 'person' }),
    ).toEqual([]);
  });

  it('removes every level of an object when see is turned off, even if all records stay readable', () => {
    const role = setCoreAgentRecordAccessLevel({
      role: setCoreAgentRecordAccessLevel({
        role: DEFAULT_SETTINGS_DRAFT_ROLE,
        level: 'edit',
        isEnabled: true,
      }),
      level: 'see',
      isEnabled: false,
      objectMetadataId: 'opportunity',
    });

    expect(getCoreAgentRecordAccessLevels({ role })).toEqual(['see', 'edit']);
    expect(
      getCoreAgentRecordAccessLevels({ role, objectMetadataId: 'opportunity' }),
    ).toEqual([]);
  });

  it('keeps see when only edit is turned off', () => {
    const role = setCoreAgentRecordAccessLevel({
      role: setCoreAgentRecordAccessLevel({
        role: DEFAULT_SETTINGS_DRAFT_ROLE,
        level: 'edit',
        isEnabled: true,
      }),
      level: 'edit',
      isEnabled: false,
    });

    expect(getCoreAgentRecordAccessLevels({ role })).toEqual(['see']);
  });
});
