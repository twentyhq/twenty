import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsApplicationContentTypeTable } from '@/settings/applications/components/SettingsApplicationContentTypeTable';
import { useApplicationContentItemDisplay } from '@/settings/applications/hooks/useApplicationContentItemDisplay';
import { useApplicationContentObjectResolver } from '@/settings/applications/hooks/useApplicationContentObjectResolver';
import { type ApplicationContent } from '@/settings/applications/types/ApplicationContent';
import { type ApplicationContentLocation } from '@/settings/applications/types/ApplicationContentLocation';
import { getApplicationContentPath } from '@/settings/applications/utils/getApplicationContentPath';
import { getApplicationContentIncludesText } from '@/settings/applications/utils/getApplicationContentIncludesText';
import { getNonEmptyApplicationContentTypes } from '@/settings/applications/utils/getNonEmptyApplicationContentTypes';

const SUMMARY_CONTENT_TYPE_LIMIT = 6;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsApplicationContentSummarySectionProps = {
  applicationId: string;
  applicationName: string;
  content: ApplicationContent;
};

export const SettingsApplicationContentSummarySection = ({
  applicationId,
  applicationName,
  content,
}: SettingsApplicationContentSummarySectionProps) => {
  const location: ApplicationContentLocation = {
    kind: 'installed',
    applicationId,
  };
  const { t } = useLingui();
  const resolveObject = useApplicationContentObjectResolver(content);
  const { getItemLabel } = useApplicationContentItemDisplay(content);

  const contentTypes = getNonEmptyApplicationContentTypes(content);

  if (contentTypes.length === 0) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Content`}
        description={t`What ${applicationName} adds to your workspace`}
      />
      <SettingsApplicationContentTypeTable
        rows={contentTypes
          .slice(0, SUMMARY_CONTENT_TYPE_LIMIT)
          .map((contentType) => ({
            contentType,
            count: content[contentType].length,
            secondaryText: getApplicationContentIncludesText({
              contentType,
              items: content[contentType],
              getItemLabel: (item) => getItemLabel({ contentType, item }),
              getObjectLabel: (objectUniversalIdentifier) =>
                resolveObject(objectUniversalIdentifier)?.label,
              unknownObjectLabel: t`Unknown object`,
              formatFieldCountOnObject: ({ count, objectLabel }) =>
                t`${count} on ${objectLabel}`,
            }),
          }))}
        secondaryColumnLabel={t`Includes`}
        location={location}
      />
      <StyledFooter>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          role="link"
          render={<Link to={getApplicationContentPath({ location })} />}
        >
          {t`See more`}
        </Button>
      </StyledFooter>
    </Section.Root>
  );
};
