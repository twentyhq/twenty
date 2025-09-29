import { ForbiddenFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ForbiddenFieldDisplay';
import { isDefined } from 'twenty-shared/utils';
import { AppTooltip } from 'twenty-ui/display';

type PageLayoutWidgetForbiddenDisplayProps = {
  widgetId: string;
  restrictionType: 'object' | 'field' | null;
  restrictedObjectName?: string;
  restrictedFieldNames?: string[];
};

export const PageLayoutWidgetForbiddenDisplay = ({
  widgetId,
  restrictionType,
  restrictedObjectName,
  restrictedFieldNames,
}: PageLayoutWidgetForbiddenDisplayProps) => {
  const tooltipId = `widget-forbidden-tooltip-${widgetId}`;

  const getTooltipContent = () => {
    if (restrictionType === 'object' && isDefined(restrictedObjectName)) {
      return `You do not have permission to ${restrictedObjectName} object`;
    }

    if (
      restrictionType === 'field' &&
      isDefined(restrictedFieldNames) &&
      restrictedFieldNames.length > 0
    ) {
      const fieldsList = restrictedFieldNames.join(', ');
      const fieldWord = restrictedFieldNames.length === 1 ? 'field' : 'fields';
      return `You do not have permission to ${fieldsList} ${fieldWord}`;
    }

    return 'You do not have permission to view this widget';
  };

  return (
    <>
      <div data-tooltip-id={tooltipId}>
        <ForbiddenFieldDisplay />
      </div>
      <AppTooltip
        anchorSelect={`[data-tooltip-id='${tooltipId}']`}
        content={getTooltipContent()}
        place="top"
      />
    </>
  );
};
