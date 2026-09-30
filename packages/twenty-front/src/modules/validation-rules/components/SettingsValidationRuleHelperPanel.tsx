import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsValidationRuleHelperDetails } from '@/validation-rules/components/SettingsValidationRuleHelperDetails';
import { SettingsValidationRuleHelperItemIcon } from '@/validation-rules/components/SettingsValidationRuleHelperItemIcon';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { type ValidationRuleHelperItem } from '@/validation-rules/types/ValidationRuleHelperItem';

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
  gap: ${themeCssVariables.spacing[0.5]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledItem = styled.div<{ isHighlighted: boolean }>`
  align-items: center;
  background: ${({ isHighlighted }) =>
    isHighlighted
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  height: 28px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledItemLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledItemPath = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-family: ${themeCssVariables.code.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  margin-left: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  editorFields: ValidationRuleEditorField[];
  onHighlight: (index: number) => void;
  onSelect: (item: ValidationRuleHelperItem) => void;
};

export const SettingsValidationRuleHelperPanel = ({
  items,
  highlightedIndex,
  editorFields,
  onHighlight,
  onSelect,
}: SettingsValidationRuleHelperPanelProps) => {
  const { t } = useLingui();

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
            <StyledItem
              key={getItemKey(item)}
              role="option"
              aria-selected={isHighlighted}
              isHighlighted={isHighlighted}
              ref={
                isHighlighted
                  ? (element: HTMLDivElement | null) =>
                      element?.scrollIntoView({ block: 'nearest' })
                  : undefined
              }
              onMouseEnter={() => onHighlight(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                onSelect(item);
              }}
            >
              <SettingsValidationRuleHelperItemIcon item={item} />
              <StyledItemLabel>
                {item.kind === 'field'
                  ? item.field.label
                  : item.definition.name}
              </StyledItemLabel>
              {item.kind === 'field' && (
                <StyledItemPath>{item.field.path}</StyledItemPath>
              )}
            </StyledItem>
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
