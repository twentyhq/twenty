import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconLink } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { Button } from 'twenty-ui/primitives/input';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { getRecordShareLabel } from '@/object-record/record-sharing/utils/getRecordShareLabel';
import { getRecordShareAccessLevelLabel } from '@/object-record/record-sharing/utils/getRecordShareAccessLevelLabel';
import { SidePanelShareRecordGroup } from '@/side-panel/pages/share-record/components/SidePanelShareRecordGroup';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { RecordSharePrincipalType } from '~/generated-metadata/graphql';

type SidePanelInheritedRecordSharesProps = {
  sharingState: ReturnType<typeof useRecordSharing>;
  search: string;
};

export const SidePanelInheritedRecordShares = ({
  sharingState,
  search,
}: SidePanelInheritedRecordSharesProps) => {
  const { t } = useLingui();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const [loading, setLoading] = useState(false);
  const sharing = sharingState.sharing;

  if (!sharing?.inheritedShares?.length) return null;
  const loadMore = async () => {
    setLoading(true);
    try {
      await sharingState.loadMoreInheritedShares();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidePanelShareRecordGroup heading={t`Shared through related records`}>
      {sharing.inheritedShares.map((share) => {
        const label =
          share.principalType === RecordSharePrincipalType.EVERYONE
            ? t`Everyone`
            : getRecordShareLabel({
                share,
                member: currentWorkspaceMembers.find(
                  (member) => member.id === share.principalId,
                ),
                role: sharing.roles.find(
                  (role) => role.id === share.principalId,
                ),
                currentWorkspaceMember,
              });
        if (!label.toLowerCase().includes(search.toLowerCase())) return null;
        const source = objectMetadataItems.find(
          (object) => object.id === share.sourceObjectMetadataId,
        );
        const path = share.fieldUniversalIdentifiers
          .map(
            (identifier) =>
              objectMetadataItems
                .flatMap((object) => object.fields)
                .find((field) => field.universalIdentifier === identifier)
                ?.label,
          )
          .filter(Boolean)
          .join(' → ');
        const access = getRecordShareAccessLevelLabel(share.accessLevel);

        return (
          <ListItem
            key={share.id}
            startIcon={<IconLink size={16} />}
            description={`${source?.labelPlural ?? t`Related record`} · ${path} · ${access}`}
            descriptionPlacement="below"
          >
            {label}
          </ListItem>
        );
      })}
      <ListItem
        description={t`These grants are managed on the related records. Receive rules and object capabilities still apply.`}
      />
      {sharing.hasMoreInheritedShares && (
        <Button
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={loadMore}
        >{t`Load more`}</Button>
      )}
    </SidePanelShareRecordGroup>
  );
};
