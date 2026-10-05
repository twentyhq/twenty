import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';

type RecordListFieldTooltipProps = {
  children: ReactNode;
};

export const RecordListFieldTooltip = ({
  children,
}: RecordListFieldTooltipProps) => {
  const { getIcon } = useIcons();
  const { fieldDefinitionByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();

  return (
    <Tooltip.Root<string>>
      {({ payload }) => {
        const fieldDefinition = isDefined(payload)
          ? fieldDefinitionByFieldMetadataItemId[payload]
          : undefined;
        const FieldIcon = isDefined(fieldDefinition)
          ? getIcon(fieldDefinition.iconName)
          : undefined;

        return (
          <>
            {children}
            <Tooltip.Popup side="bottom" positionMethod="fixed">
              <Tooltip.Content
                startIcon={isDefined(FieldIcon) ? <FieldIcon /> : undefined}
              >
                {fieldDefinition?.label}
              </Tooltip.Content>
            </Tooltip.Popup>
          </>
        );
      }}
    </Tooltip.Root>
  );
};
