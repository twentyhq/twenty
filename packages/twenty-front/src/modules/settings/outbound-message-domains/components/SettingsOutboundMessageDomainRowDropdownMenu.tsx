import { VERIFY_OUTBOUND_MESSAGE_DOMAIN } from '@/settings/outbound-message-domains/graphql/mutations/verifyOutboundMessageDomain';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useMutation } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconDotsVertical, IconShield, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import {
  type GetOutboundMessageDomainsQuery,
  OutboundMessageDomainStatus,
  useDeleteOutboundMessageDomainMutation,
} from '~/generated-metadata/graphql';

type SettingsOutboundMessageDomainRowDropdownMenuProps = {
  outboundMessageDomain: GetOutboundMessageDomainsQuery['getOutboundMessageDomains'][0];
};

export const SettingsOutboundMessageDomainRowDropdownMenu = ({
  outboundMessageDomain,
}: SettingsOutboundMessageDomainRowDropdownMenuProps) => {
  const dropdownId = `settings-outbound-message-domain-row-${outboundMessageDomain.id}`;

  const { enqueueErrorSnackBar } = useSnackBar();

  const { closeDropdown } = useCloseDropdown();

  const [deleteOutboundMessageDomainMutation] =
    useDeleteOutboundMessageDomainMutation();

  const [verifyOutboundMessageDomain] = useMutation(
    VERIFY_OUTBOUND_MESSAGE_DOMAIN,
  );

  const handleDeleteOutboundMessageDomain = async () => {
    const result = await deleteOutboundMessageDomainMutation({
      variables: {
        input: {
          id: outboundMessageDomain.id,
        },
      },
    });
    if (isDefined(result.errors)) {
      enqueueErrorSnackBar({
        message: t`Could not delete outbound message domain`,
        options: {
          duration: 2000,
        },
      });
    }
  };

  const handleVerifyOutboundMessageDomain = async () => {
    const result = await verifyOutboundMessageDomain({
      variables: {
        input: {
          id: outboundMessageDomain.id,
        },
      },
    });
    if (isDefined(result.errors)) {
      enqueueErrorSnackBar({
        message: t`Could not verify outbound message domain`,
        options: {
          duration: 2000,
        },
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
              text="Delete"
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
