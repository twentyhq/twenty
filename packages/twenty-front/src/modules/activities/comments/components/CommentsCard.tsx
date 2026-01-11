import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { CommentForm } from '@/activities/comments/components/CommentForm';
import { CommentList } from '@/activities/comments/components/CommentList';
import { useComments } from '@/activities/comments/hooks/useComments';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

const StyledCommentsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledCommentsScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

const StyledFormWrapper = styled.div`
  flex-shrink: 0;
`;

export const CommentsCard = () => {
  const targetRecord = useTargetRecord();
  const {
    comments,
    loading,
    totalCountComments,
    fetchMoreComments,
    hasNextPage,
  } = useComments(targetRecord);

  const handleLastRowVisible = async () => {
    if (hasNextPage) {
      await fetchMoreComments();
    }
  };

  const isCommentsEmpty = !comments || comments.length === 0;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  if (loading && isCommentsEmpty) {
    return <SkeletonLoader />;
  }

  if (isCommentsEmpty) {
    return (
      <StyledCommentsContainer>
        <StyledCommentsScrollArea />
        <StyledFormWrapper>
          {hasObjectUpdatePermissions && (
            <CommentForm targetableObject={targetRecord} />
          )}
        </StyledFormWrapper>
      </StyledCommentsContainer>
    );
  }

  return (
    <StyledCommentsContainer>
      <StyledCommentsScrollArea>
        <CommentList
          title={t`Comments`}
          comments={comments}
          totalCount={totalCountComments}
        />
        <CustomResolverFetchMoreLoader
          loading={loading}
          onLastRowVisible={handleLastRowVisible}
        />
      </StyledCommentsScrollArea>
      <StyledFormWrapper>
        {hasObjectUpdatePermissions && (
          <CommentForm targetableObject={targetRecord} />
        )}
      </StyledFormWrapper>
    </StyledCommentsContainer>
  );
};
