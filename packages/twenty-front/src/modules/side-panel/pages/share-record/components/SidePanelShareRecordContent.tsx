import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLink } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelShareRecordAddPeopleItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordAddPeopleItem';
import { SidePanelShareRecordGeneralAccessItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordGeneralAccessItem';
import { SidePanelShareRecordRecipient } from '@/side-panel/pages/share-record/components/SidePanelShareRecordRecipient';
import { SidePanelShareRecordRetryItem } from '@/side-panel/pages/share-record/components/SidePanelShareRecordRetryItem';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import {
  ObjectSharingReach,
  RecordSharePrincipalType,
  RecordShareRowCause,
  RecordSharingMode,
} from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const ADD_PEOPLE_ITEM_ID = 'share-record-add-people';
const GENERAL_ACCESS_ITEM_ID = 'share-record-general-access';
const RETRY_ITEM_ID = 'share-record-retry';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledListContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]};
  white-space: normal;
`;

type SidePanelShareRecordContentProps = {
  recordUrl: string;
  objectLabelPlural: string;
  sharingReach: ObjectSharingReach;
  sharingState: ReturnType<typeof useRecordSharing>;
};

export const SidePanelShareRecordContent = ({
  recordUrl,
  objectLabelPlural,
  sharingReach,
  sharingState,
}: SidePanelShareRecordContentProps) => {
  const { t } = useLingui();
  const {
    sharing,
    loading,
    error,
    saving,
    setGeneralAccess,
    setShare,
    removeShare,
    refetch,
  } = sharingState;
  const { copyToClipboard } = useCopyToClipboard();
  const canManageSharing = sharing?.canManageSharing ?? false;
  const recipientGroups = [
    {
      heading: t`Roles`,
      shares: (sharing?.shares ?? []).filter(
        (share) => share.principalType === RecordSharePrincipalType.ROLE,
      ),
    },
    {
      heading: t`Users`,
      shares: (sharing?.shares ?? []).filter(
        (share) =>
          share.principalType === RecordSharePrincipalType.WORKSPACE_MEMBER,
      ),
    },
  ];

  const selectableItemIds = isDefined(error)
    ? [RETRY_ITEM_ID]
    : canManageSharing
      ? [
          ADD_PEOPLE_ITEM_ID,
          GENERAL_ACCESS_ITEM_ID,
          ...recipientGroups.flatMap(({ shares }) =>
            shares
              .filter((share) => share.rowCause === RecordShareRowCause.MANUAL)
              .map((share) => share.id),
          ),
        ]
      : [];

  return (
    <StyledContainer>
      <StyledListContainer>
        <SidePanelList selectableItemIds={selectableItemIds} loading={loading}>
          {isDefined(error) ? (
            <>
              <StyledDescription role="alert">{t`Sharing settings could not be loaded.`}</StyledDescription>
              <SidePanelShareRecordRetryItem
                itemId={RETRY_ITEM_ID}
                refetch={refetch}
              />
            </>
          ) : (
            isDefined(sharing) &&
            (canManageSharing ? (
              <>
                <SidePanelShareRecordAddPeopleItem
                  itemId={ADD_PEOPLE_ITEM_ID}
                  sharing={sharing}
                  saving={saving}
                  setShare={setShare}
                />
                <SidePanelGroup heading={t`Everyone`}>
                  <SidePanelShareRecordGeneralAccessItem
                    itemId={GENERAL_ACCESS_ITEM_ID}
                    generalAccessLevel={sharing.generalAccessLevel}
                    defaultGeneralAccessLevel={
                      sharing.defaultGeneralAccessLevel
                    }
                    hasManagedGeneralAccess={sharing.hasManagedGeneralAccess}
                    objectLabelPlural={objectLabelPlural}
                    saving={saving}
                    setGeneralAccess={setGeneralAccess}
                  />
                </SidePanelGroup>
                {recipientGroups.map(({ heading, shares }) => (
                  <SidePanelGroup key={heading} heading={heading}>
                    {shares.map((share) => (
                      <SidePanelShareRecordRecipient
                        key={share.id}
                        share={share}
                        roles={sharing.roles}
                        objectLabelPlural={objectLabelPlural}
                        sharingReach={sharingReach}
                        isSaving={saving}
                        setShare={setShare}
                        removeShare={removeShare}
                      />
                    ))}
                  </SidePanelGroup>
                ))}
                <StyledDescription>
                  {sharing.hasManagedGeneralAccess
                    ? t`Workspace access is also managed by an application.`
                    : sharing.sharingMode === RecordSharingMode.INHERITED
                      ? t`Access is also inherited from related records.`
                      : sharingReach === ObjectSharingReach.WORKSPACE
                        ? t`People you add get this record even if their role can't access ${objectLabelPlural}. Field permissions still apply.`
                        : t`Role and field permissions still apply.`}
                </StyledDescription>
              </>
            ) : (
              <StyledDescription>
                {sharing.sharingMode === RecordSharingMode.ROLE_ONLY
                  ? t`Access to ${objectLabelPlural} is set by roles, not record by record.`
                  : sharing.sharingMode === RecordSharingMode.OPEN_BY_DEFAULT
                    ? t`Only the creator of this record, people with full access to it and admins can change who has access.`
                    : t`Only the creator of this record and people with full access to it can change who has access.`}
              </StyledDescription>
            ))
          )}
        </SidePanelList>
      </StyledListContainer>
      <SidePanelFooter
        actions={[
          <Button
            key="copy-link"
            size="sm"
            variant="outline"
            startIcon={<IconLink />}
            onClick={() => {
              void copyToClipboard(recordUrl);
            }}
          >{t`Copy link`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
