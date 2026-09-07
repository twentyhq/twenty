import { Injectable } from '@nestjs/common';

import { Client, type GraphError } from '@microsoft/microsoft-graph-client';
import { type Group, type User } from '@microsoft/microsoft-graph-types';
import { isDefined } from 'twenty-shared/utils';

import {
  EmailForwardingDriverException,
  EmailForwardingDriverExceptionCode,
} from 'src/engine/core-modules/email-forwarding/drivers/exceptions/email-forwarding-driver.exception';
import { type EmailForwardingDriverInterface } from 'src/engine/core-modules/email-forwarding/drivers/interfaces/email-forwarding-driver.interface';
import { MICROSOFT_GRAPH_RETRY_COUNT } from 'src/engine/core-modules/email-forwarding/drivers/microsoft/constants/microsoft-graph-retry-count.constant';
import { MICROSOFT_GRAPH_RETRY_DELAY_MS } from 'src/engine/core-modules/email-forwarding/drivers/microsoft/constants/microsoft-graph-retry-delay-ms.constant';
import { MICROSOFT_GUEST_INVITE_REDIRECT_URL } from 'src/engine/core-modules/email-forwarding/drivers/microsoft/constants/microsoft-guest-invite-redirect-url.constant';
import { parseMicrosoftEmailForwardingError } from 'src/engine/core-modules/email-forwarding/drivers/microsoft/utils/parse-microsoft-email-forwarding-error.util';
import { type CreateForwardingAddressInput } from 'src/engine/core-modules/email-forwarding/drivers/types/create-forwarding-address-input.type';
import { type DeleteForwardingAddressInput } from 'src/engine/core-modules/email-forwarding/drivers/types/delete-forwarding-address-input.type';
import { MicrosoftOAuth2ClientAuthProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-auth-provider';

@Injectable()
export class MicrosoftEmailForwardingService implements EmailForwardingDriverInterface {
  async createForwardingAddress({
    sourceAddress,
    destinationAddress,
    displayName,
    accessToken,
  }: CreateForwardingAddressInput): Promise<void> {
    const client = this.getClient(accessToken);

    const group =
      (await this.findGroup(client, sourceAddress)) ??
      (await this.createGroup(client, sourceAddress, displayName));

    if (!isDefined(group.id)) {
      throw new EmailForwardingDriverException(
        `Microsoft Graph returned the group for ${sourceAddress} without an id`,
        EmailForwardingDriverExceptionCode.UNKNOWN,
      );
    }

    const destinationUserId = await this.inviteDestinationUser(
      client,
      destinationAddress,
    );

    await this.addDestinationMember(client, group.id, destinationUserId);
    await this.allowExternalDelivery(client, group.id);
  }

  async deleteForwardingAddress({
    sourceAddress,
    destinationAddress,
    accessToken,
  }: DeleteForwardingAddressInput): Promise<void> {
    const client = this.getClient(accessToken);

    const group = await this.findGroup(client, sourceAddress);

    if (!isDefined(group?.id)) {
      return;
    }

    const destinationUser = await this.findGroupMember(
      client,
      group.id,
      destinationAddress,
    );

    if (!isDefined(destinationUser?.id)) {
      return;
    }

    try {
      await client
        .api(`/groups/${group.id}/members/${destinationUser.id}/$ref`)
        .delete();
    } catch (error) {
      if ((error as GraphError).statusCode === 404) {
        return;
      }

      throw parseMicrosoftEmailForwardingError(error as GraphError);
    }
  }

  private getClient(accessToken: string): Client {
    return Client.initWithMiddleware({
      defaultVersion: 'v1.0',
      debugLogging: false,
      authProvider: new MicrosoftOAuth2ClientAuthProvider(accessToken),
    });
  }

  private async findGroup(
    client: Client,
    sourceAddress: string,
  ): Promise<Group | null> {
    try {
      const response = await client
        .api('/groups')
        .filter(`mail eq '${sourceAddress}'`)
        .select('id,mail,displayName')
        .top(1)
        .get();

      return response.value?.[0] ?? null;
    } catch (error) {
      throw parseMicrosoftEmailForwardingError(error as GraphError);
    }
  }

  private async createGroup(
    client: Client,
    sourceAddress: string,
    displayName: string,
  ): Promise<Group> {
    const [mailNickname] = sourceAddress.split('@');

    let group: Group;

    try {
      group = await client.api('/groups').post({
        displayName,
        mailEnabled: true,
        mailNickname,
        securityEnabled: false,
        groupTypes: ['Unified'],
      });
    } catch (error) {
      throw parseMicrosoftEmailForwardingError(error as GraphError);
    }

    if (group.mail?.toLowerCase() === sourceAddress.toLowerCase()) {
      return group;
    }

    // Graph rejects `mail` on create and always places a new group on the tenant default
    // domain, so an address on any other verified domain cannot be provisioned here.
    await client.api(`/groups/${group.id}`).delete();

    throw new EmailForwardingDriverException(
      `Microsoft 365 created the group as ${group.mail} instead of ${sourceAddress}. Microsoft Graph always places new groups on the tenant default domain, so this address has to be set up manually.`,
      EmailForwardingDriverExceptionCode.SOURCE_ADDRESS_DOMAIN_NOT_OWNED,
    );
  }

  private async allowExternalDelivery(
    client: Client,
    groupId: string,
  ): Promise<void> {
    // allowExternalSenders lives in Exchange, which reports the group as invalid
    // until its mailbox finishes provisioning a few seconds after creation.
    for (let attempt = 1; attempt <= MICROSOFT_GRAPH_RETRY_COUNT; attempt++) {
      try {
        await client.api(`/groups/${groupId}`).patch({
          allowExternalSenders: true,
          autoSubscribeNewMembers: true,
        });

        return;
      } catch (error) {
        const isMailboxNotReadyYet = (error as GraphError).statusCode === 404;

        if (!isMailboxNotReadyYet || attempt === MICROSOFT_GRAPH_RETRY_COUNT) {
          throw parseMicrosoftEmailForwardingError(error as GraphError);
        }

        await new Promise((resolve) =>
          setTimeout(resolve, MICROSOFT_GRAPH_RETRY_DELAY_MS),
        );
      }
    }
  }

  private async inviteDestinationUser(
    client: Client,
    destinationAddress: string,
  ): Promise<string> {
    let invitation;

    try {
      invitation = await client.api('/invitations').post({
        invitedUserEmailAddress: destinationAddress,
        inviteRedirectUrl: MICROSOFT_GUEST_INVITE_REDIRECT_URL,
        sendInvitationMessage: false,
      });
    } catch (error) {
      throw parseMicrosoftEmailForwardingError(error as GraphError);
    }

    const invitedUserId = invitation.invitedUser?.id;

    if (!isDefined(invitedUserId)) {
      throw new EmailForwardingDriverException(
        `Microsoft Graph did not return a guest user for ${destinationAddress}`,
        EmailForwardingDriverExceptionCode.UNKNOWN,
      );
    }

    return invitedUserId;
  }

  // Reading the destination back off the group avoids needing directory-wide
  // User.Read.All just to locate one guest we put there ourselves.
  private async findGroupMember(
    client: Client,
    groupId: string,
    destinationAddress: string,
  ): Promise<User | null> {
    try {
      const response = await client
        .api(`/groups/${groupId}/members`)
        .select('id,mail')
        .get();

      return (
        (response.value as User[])?.find(
          (member) =>
            member.mail?.toLowerCase() === destinationAddress.toLowerCase(),
        ) ?? null
      );
    } catch (error) {
      throw parseMicrosoftEmailForwardingError(error as GraphError);
    }
  }

  private async addDestinationMember(
    client: Client,
    groupId: string,
    destinationUserId: string,
  ): Promise<void> {
    // A freshly invited guest is not replicated across the directory yet, so the
    // first reference writes can be rejected before the object becomes usable.
    for (let attempt = 1; attempt <= MICROSOFT_GRAPH_RETRY_COUNT; attempt++) {
      try {
        await client.api(`/groups/${groupId}/members/$ref`).post({
          '@odata.id': `https://graph.microsoft.com/v1.0/directoryObjects/${destinationUserId}`,
        });

        return;
      } catch (error) {
        const graphError = error as GraphError;

        if (graphError.message?.includes('already exist')) {
          return;
        }

        if (attempt === MICROSOFT_GRAPH_RETRY_COUNT) {
          throw parseMicrosoftEmailForwardingError(graphError);
        }

        await new Promise((resolve) =>
          setTimeout(resolve, MICROSOFT_GRAPH_RETRY_DELAY_MS),
        );
      }
    }
  }
}
