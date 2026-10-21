import { useAddConditionalDisplayRecordFilter } from '@/conditional-display/hooks/useAddConditionalDisplayRecordFilter';
import { type ConditionalDisplayVisibilityMode } from '@/conditional-display/types/ConditionalDisplayVisibilityMode';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { Select } from '@/ui/input/components/Select';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import {
  assertUnreachable,
  getSettingsPath,
  isDefined,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.light};
  display: block;
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};

  & > a {
    color: ${themeCssVariables.font.color.light};

    &:hover {
      color: ${themeCssVariables.font.color.tertiary};
    }
  }
`;

type ConditionalDisplayVisibilityModeSelectProps = {
  dropdownId: string;
  label: string;
  visibilityMode: ConditionalDisplayVisibilityMode;
  readonly?: boolean;
  onEveryoneSelect: () => void;
};

export const ConditionalDisplayVisibilityModeSelect = ({
  dropdownId,
  label,
  visibilityMode,
  readonly,
  onEveryoneSelect,
}: ConditionalDisplayVisibilityModeSelectProps) => {
  const { t } = useLingui();

  const { availableContextKeys = [] } = useContext(AdvancedFilterContext);

  const { addConditionalDisplayRecordFilter } =
    useAddConditionalDisplayRecordFilter();

  const setCurrentRecordFilters = useSetAtomComponentState(
    currentRecordFiltersComponentState,
  );

  const setCurrentRecordFilterGroups = useSetAtomComponentState(
    currentRecordFilterGroupsComponentState,
  );

  const [defaultContextKey] = availableContextKeys;

  const handleVisibilityModeChange = (
    nextVisibilityMode: ConditionalDisplayVisibilityMode,
  ) => {
    if (nextVisibilityMode === visibilityMode) {
      return;
    }

    switch (nextVisibilityMode) {
      case 'EVERYONE':
        setCurrentRecordFilters([]);
        setCurrentRecordFilterGroups([]);
        onEveryoneSelect();
        return;
      case 'CUSTOM_RULE':
        if (isDefined(defaultContextKey)) {
          addConditionalDisplayRecordFilter(defaultContextKey);
        }
        return;
      default:
        assertUnreachable(nextVisibilityMode);
    }
  };

  const rolesSettingsPath = getSettingsPath(SettingsPath.Roles);

  return (
    <div>
      <Select<ConditionalDisplayVisibilityMode>
        dropdownId={dropdownId}
        label={label}
        fullWidth
        disabled={readonly}
        value={visibilityMode}
        onChange={handleVisibilityModeChange}
        options={[
          { label: t`Everyone`, value: 'EVERYONE' },
          { label: t`Custom rule`, value: 'CUSTOM_RULE' },
        ]}
      />
      <StyledHint>
        <Trans>
          Hiding an item does not restrict access to data. Use{' '}
          <Link to={rolesSettingsPath}>role permissions</Link> for that.
        </Trans>
      </StyledHint>
    </div>
  );
};
