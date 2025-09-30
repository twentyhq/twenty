import { ForbiddenFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ForbiddenFieldDisplay';
import { t } from '@lingui/core/macro';
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
      return t`You do not have permission to access the ${restrictedObjectName} object`;
    }

    if (
      restrictionType === 'field' &&
      isDefined(restrictedFieldNames) &&
      restrictedFieldNames.length > 0
    ) {
      const fieldsList = restrictedFieldNames.join(', ');
      const fieldWord = restrictedFieldNames.length === 1 ? 'field' : 'fields';
      return t`You do not have permission to access the ${fieldsList} ${fieldWord}`;
    }

    return t`You do not have permission to view this widget`;
  };

  return (
    <>
      <div id={tooltipId}>
        <ForbiddenFieldDisplay />
      </div>
      <AppTooltip
        anchorSelect={`#${tooltipId}`}
        content={getTooltipContent()}
        place="top"
      />
    </>
  );
};
