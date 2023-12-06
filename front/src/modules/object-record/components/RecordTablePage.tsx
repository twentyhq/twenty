import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { IconBuildingSkyscraper } from '@/ui/display/icon';
import { PageAddButton } from '@/ui/layout/page/PageAddButton';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { PageHotkeysEffect } from '@/ui/layout/page/PageHotkeysEffect';
import { RecordTableActionBar } from '@/ui/object/record-table/action-bar/components/RecordTableActionBar';
import { RecordTableContextMenu } from '@/ui/object/record-table/context-menu/components/RecordTableContextMenu';

import { RecordTableContainer } from './RecordTableContainer';

const StyledTableContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

export const RecordTablePage = () => {
  const objectNamePlural = useParams().objectNamePlural ?? '';

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const onboardingStatus = useOnboardingStatus();

  const navigate = useNavigate();

  useEffect(() => {
    if (
      !isNonEmptyString(objectNamePlural) &&
      onboardingStatus === OnboardingStatus.Completed
    ) {
      navigate('/');
    }
  }, [objectNamePlural, navigate, onboardingStatus]);

  const { createOneRecord: createOneObject } = useCreateOneRecord({
    objectNameSingular,
  });

  const handleAddButtonClick = async () => {
    await createOneObject?.({});
  };

  return (
    <PageContainer>
      <PageHeader title="Objects" Icon={IconBuildingSkyscraper}>
        <PageHotkeysEffect onAddButtonClick={handleAddButtonClick} />
        <PageAddButton onClick={handleAddButtonClick} />
      </PageHeader>
      <PageBody>
        <StyledTableContainer>
          <RecordTableContainer
            objectNamePlural={objectNamePlural}
            createRecord={handleAddButtonClick}
          />
        </StyledTableContainer>
        <RecordTableActionBar />
        <RecordTableContextMenu />
      </PageBody>
    </PageContainer>
  );
};
