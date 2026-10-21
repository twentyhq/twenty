import { useConditionalDisplayBuilderContext } from '@/conditional-display/contexts/ConditionalDisplayBuilderContext';
import { useApplyConditionalDisplayContextKey } from '@/conditional-display/hooks/useApplyConditionalDisplayContextKey';
import { getConditionalDisplayContextKeyIcon } from '@/conditional-display/utils/getConditionalDisplayContextKeyIcon';
import { getConditionalDisplayContextKeyLabel } from '@/conditional-display/utils/getConditionalDisplayContextKeyLabel';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { Fragment } from 'react';
import { type ConditionalDisplayContextKey } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

type ConditionalDisplaySubjectSectionsProps = {
  recordFilterId: string;
  searchInput: string;
};

export const ConditionalDisplaySubjectSections = ({
  recordFilterId,
  searchInput,
}: ConditionalDisplaySubjectSectionsProps) => {
  const { t } = useLingui();

  const { availableContextKeys } = useConditionalDisplayBuilderContext();

  const { closeAdvancedFilterFieldSelectDropdown } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const { applyConditionalDisplayContextKey } =
    useApplyConditionalDisplayContextKey();

  const contextKeysMatchingSearchInput = availableContextKeys.filter(
    (contextKey) =>
      getConditionalDisplayContextKeyLabel(contextKey)
        .toLocaleLowerCase()
        .includes(searchInput.toLocaleLowerCase()),
  );

  const sections = [
    {
      id: 'current-user',
      label: t`Current user`,
      contextKeys: contextKeysMatchingSearchInput.filter(
        (contextKey) => contextKey !== 'device',
      ),
    },
    {
      id: 'device',
      label: t`Device`,
      contextKeys: contextKeysMatchingSearchInput.filter(
        (contextKey) => contextKey === 'device',
      ),
    },
  ].filter((section) => isNonEmptyArray(section.contextKeys));

  const handleContextKeySelect = (contextKey: ConditionalDisplayContextKey) => {
    applyConditionalDisplayContextKey({ contextKey, recordFilterId });
    closeAdvancedFilterFieldSelectDropdown();
  };

  return (
    <>
      {sections.map((section) => (
        <Fragment key={section.id}>
          <Dropdown.Separator />
          <Dropdown.Section label={section.label}>
            {section.contextKeys.map((contextKey) => (
              <Dropdown.OptionItem
                key={contextKey}
                closeOnSelect={false}
                onSelect={() => handleContextKeySelect(contextKey)}
                startIcon={
                  <SelectOptionIcon
                    Icon={getConditionalDisplayContextKeyIcon(contextKey)}
                  />
                }
              >
                {getConditionalDisplayContextKeyLabel(contextKey)}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.Section>
        </Fragment>
      ))}
    </>
  );
};
