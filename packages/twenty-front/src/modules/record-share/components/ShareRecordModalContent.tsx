import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ShareRecordAddGrantForm } from '@/record-share/components/ShareRecordAddGrantForm';
import { ShareRecordGrantRow } from '@/record-share/components/ShareRecordGrantRow';
import { useRecordShares } from '@/record-share/hooks/useRecordShares';
import { useShareRecord } from '@/record-share/hooks/useShareRecord';
import { useUnshareRecord } from '@/record-share/hooks/useUnshareRecord';
import { type ShareRecordModalTarget } from '@/record-share/types/ShareRecordModalTarget';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from '~/generated-metadata/graphql';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledNotice = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledGrantList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

type ShareRecordModalContentProps = ShareRecordModalTarget;

export const ShareRecordModalContent = ({
  objectMetadataId,
  recordId,
}: ShareRecordModalContentProps) => {
  const { t } = useLingui();
  const { data, shares, viewerAccessLevel, loading, error } = useRecordShares({
    objectMetadataId,
    recordId,
  });
  const { shareRecord } = useShareRecord({ objectMetadataId, recordId });
  const { unshareRecord } = useUnshareRecord({ objectMetadataId, recordId });

  const canEdit = viewerAccessLevel === RecordShareAccessLevel.FULL;

  const shareWithPrincipalOf = (share: (typeof shares)[number]) => {
    switch (share.principalType) {
      case RecordSharePrincipalType.EVERYONE:
        return { everyone: true };
      case RecordSharePrincipalType.WORKSPACE_MEMBER:
        return { workspaceMemberId: share.principalId };
      case RecordSharePrincipalType.ROLE:
        return { roleId: share.principalId };
    }
  };

  if (isDefined(error)) {
    return (
      <StyledContent>
        <StyledNotice>{t`The sharing settings of this record could not be loaded.`}</StyledNotice>
      </StyledContent>
    );
  }

  if (loading && !isDefined(data)) {
    return null;
  }

  return (
    <StyledContent>
      {canEdit ? (
        <ShareRecordAddGrantForm
          shares={shares}
          onShare={(shareWith) => shareRecord([shareWith])}
        />
      ) : (
        <StyledNotice>
          {t`Only members with full access can change who this record is shared with.`}
        </StyledNotice>
      )}
      <StyledGrantList>
        {shares.map((share) => (
          <ShareRecordGrantRow
            key={share.id}
            share={share}
            canEdit={canEdit}
            onAccessLevelChange={(accessLevel) =>
              shareRecord([{ ...shareWithPrincipalOf(share), accessLevel }])
            }
            onRemove={() => unshareRecord(share.principalId)}
          />
        ))}
      </StyledGrantList>
    </StyledContent>
  );
};
