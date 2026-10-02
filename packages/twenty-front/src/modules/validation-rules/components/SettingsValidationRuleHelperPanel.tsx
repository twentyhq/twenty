import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/components';
import { useIcons } from 'twenty-ui/icon';
import { Shortcut } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsValidationRuleHelperDetails } from '@/validation-rules/components/SettingsValidationRuleHelperDetails';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { type ValidationRuleHelperItem } from '@/validation-rules/types/ValidationRuleHelperItem';
import { getValidationRuleHelperItemIcon } from '@/validation-rules/utils/getValidationRuleHelperItemIcon';

const StyledPanel = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: grid;
  font-size: ${themeCssVariables.font.size.md};
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  height: 240px;
  overflow: hidden;
`;

const StyledList = styled.div`
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.light};
  padding: ${themeCssVariables.spacing[2]};
`;

const getItemKey = (item: ValidationRuleHelperItem) =>
  item.kind === 'field'
    ? `field:${item.field.path}`
    : `${item.kind}:${item.definition.name}`;

type SettingsValidationRuleHelperPanelProps = {
  items: ValidationRuleHelperItem[];
  highlightedIndex: number;
  isEnterHintVisible: boolean;
  editorFields: ValidationRuleEditorField[];
  onHighlight: (index: number) => void;
  onSelect: (item: ValidationRuleHelperItem) => void;
};

export const SettingsValidationRuleHelperPanel = ({
  items,
  highlightedIndex,
  isEnterHintVisible,
  editorFields,
  onHighlight,
  onSelect,
}: SettingsValidationRuleHelperPanelProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const highlightedItem = items[highlightedIndex];

  return (
    <StyledPanel>
      <StyledList role="listbox" aria-label={t`Suggestions`}>
        {items.length === 0 && (
          <StyledEmpty>{t`Nothing to suggest here.`}</StyledEmpty>
        )}
        {items.map((item, index) => {
          const isHighlighted = index === highlightedIndex;

          return (
            <div
              key={getItemKey(item)}
              role="option"
              aria-selected={isHighlighted}
              ref={
                isHighlighted
                  ? (element: HTMLDivElement | null) =>
                      element?.scrollIntoView({ block: 'nearest' })
                  : undefined
              }
              onMouseDown={(event) => event.preventDefault()}
            >
              <MenuItem
                LeftIcon={getValidationRuleHelperItemIcon({ item, getIcon })}
                text={
                  item.kind === 'field'
                    ? item.field.label
                    : item.definition.name
                }
                RightComponent={
                  isHighlighted &&
                  isEnterHintVisible && (
                    <Shortcut shortcut={['Enter']} variant="text" />
                  )
                }
                focused={isHighlighted}
                onMouseEnter={() => onHighlight(index)}
                onClick={() => onSelect(item)}
              />
            </div>
          );
        })}
      </StyledList>
      {isDefined(highlightedItem) ? (
        <SettingsValidationRuleHelperDetails
          item={highlightedItem}
          editorFields={editorFields}
        />
      ) : (
        <div />
      )}
    </StyledPanel>
  );
};
