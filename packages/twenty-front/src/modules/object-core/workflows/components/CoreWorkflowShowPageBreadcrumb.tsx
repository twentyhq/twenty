import { styled } from '@linaria/react';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';

const StyledIndexLabel = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledObjectIcon = styled.span`
  display: flex;
  flex-shrink: 0;
  opacity: 0.64;
`;

type CoreWorkflowShowPageBreadcrumbProps = {
  name: string;
};

export const CoreWorkflowShowPageBreadcrumb = ({
  name,
}: CoreWorkflowShowPageBreadcrumbProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  return (
    <Breadcrumb
      links={[
        {
          children: (
            <StyledIndexLabel>
              <StyledObjectIcon>
                <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
              </StyledObjectIcon>
              {objectMetadataItem.labelPlural}
            </StyledIndexLabel>
          ),
          href: getAppPath(AppPath.WorkflowCoreIndexPage),
        },
        { children: name },
      ]}
    />
  );
};
