import { ForbiddenFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ForbiddenFieldDisplay';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';
import { plural, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { AppTooltip } from 'twenty-ui/display';

type PageLayoutWidgetForbiddenDisplayProps = {
  widgetId: string;
  restriction: WidgetAccessDenialInfo;
};

export const PageLayoutWidgetForbiddenDisplay = ({
  widgetId,
  restriction,
}: PageLayoutWidgetForbiddenDisplayProps) => {
  const tooltipId = `widget-forbidden-tooltip-${widgetId}`;

  const getTooltipContent = () => {
    if (restriction.type === 'object' && isDefined(restriction.objectName)) {
      const objectName = restriction.objectName;
      return t`You do not have permission to access the ${objectName} object`;
    }

    if (
      restriction.type === 'field' &&
      isDefined(restriction.fieldNames) &&
      restriction.fieldNames.length > 0
    ) {
      const fieldsList = restriction.fieldNames.join(', ');
      return plural(restriction.fieldNames.length, {
        one: `You do not have permission to access the ${fieldsList} field`,
        other: `You do not have permission to access the ${fieldsList} fields`,
      });
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
