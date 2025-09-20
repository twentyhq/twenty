import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { IconDotsVertical, IconShield, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import {
  type GetOutboundMessageDomainsQuery,
  OutboundMessageDomainStatus,
  useDeleteOutboundMessageDomainMutation,
  useGetOutboundMessageDomainsQuery,
  useVerifyOutboundMessageDomainMutation,
} from '~/generated-metadata/graphql';

type SettingsOutboundMessageDomainRowDropdownMenuProps = {
  outboundMessageDomain: GetOutboundMessageDomainsQuery['getOutboundMessageDomains'][0];
};

export const SettingsOutboundMessageDomainRowDropdownMenu = ({
  outboundMessageDomain,
}: SettingsOutboundMessageDomainRowDropdownMenuProps) => {
  const dropdownId = `settings-outbound-message-domain-row-${outboundMessageDomain.id}`;

  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const { closeDropdown } = useCloseDropdown();

  const { refetch: refetchOutboundMessageDomains } =
    useGetOutboundMessageDomainsQuery();

  const [deleteOutboundMessageDomainMutation] =
    useDeleteOutboundMessageDomainMutation();

  const [verifyOutboundMessageDomainMutation] =
    useVerifyOutboundMessageDomainMutation();

  const handleDeleteOutboundMessageDomain = async () => {
    try {
      await deleteOutboundMessageDomainMutation({
        variables: {
          id: outboundMessageDomain.id,
        },
      });

      enqueueSuccessSnackBar({
        message: t`Outbound message domain deleted successfully`,
      });

      await refetchOutboundMessageDomains();
    } catch (error) {
      enqueueErrorSnackBar({
        ...(error instanceof ApolloError ? { apolloError: error } : {}),
      });
    }
  };

  const handleVerifyOutboundMessageDomain = async () => {
    try {
      await verifyOutboundMessageDomainMutation({
        variables: {
          id: outboundMessageDomain.id,
        },
      });
      enqueueSuccessSnackBar({
        message: t`Started verification process`,
      });

      await refetchOutboundMessageDomains();
    } catch (error) {
      enqueueErrorSnackBar({
        ...(error instanceof ApolloError ? { apolloError: error } : {}),
      });
    }
  };
  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {outboundMessageDomain.status !==
              OutboundMessageDomainStatus.VERIFIED && (
              <MenuItem
                LeftIcon={IconShield}
                text={t`Verify Domain`}
                onClick={() => {
                  handleVerifyOutboundMessageDomain();
                  closeDropdown(dropdownId);
                }}
              />
            )}
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text={t`Delete`}
              onClick={() => {
                handleDeleteOutboundMessageDomain();
                closeDropdown(dropdownId);
              }}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
