import { Injectable } from '@nestjs/common';

interface CustomerHealthInput {
  accountId: string;
  accountName: string;
  productUsageScore: number;
  supportLoadScore: number;
  paymentBehaviorScore: number;
  relationshipScore: number;
}

interface CustomerHealthRequest {
  accounts: CustomerHealthInput[];
  weights?: {
    productUsageScore: number;
    supportLoadScore: number;
    paymentBehaviorScore: number;
    relationshipScore: number;
  };
}

interface SurveyTriggerInput {
  accountId: string;
  eventType:
    | 'onboarding_completed'
    | 'ticket_closed'
    | 'qbr_completed'
    | 'renewal_completed';
  eventDate: string;
  preferredChannel: 'email' | 'whatsapp' | 'sms';
}

interface SurveyAutomationRequest {
  triggers: SurveyTriggerInput[];
  cooldownDays?: number;
}

interface RenewalInput {
  accountId: string;
  contractId: string;
  renewalDate: string;
  ownerId: string;
  mrr: number;
}

interface RenewalRequest {
  contracts: RenewalInput[];
}

@Injectable()
export class CustomerSuccessService {
  private getTrafficLight(score: number): 'green' | 'yellow' | 'red' {
    if (score >= 75) {
      return 'green';
    }

    if (score >= 50) {
      return 'yellow';
    }

    return 'red';
  }

  calculateCustomerHealth(request: CustomerHealthRequest) {
    const weights = {
      productUsageScore: 0.35,
      supportLoadScore: 0.2,
      paymentBehaviorScore: 0.25,
      relationshipScore: 0.2,
      ...(request.weights ?? {}),
    };

    const scoredAccounts = request.accounts.map((account) => {
      const score =
        account.productUsageScore * weights.productUsageScore +
        account.supportLoadScore * weights.supportLoadScore +
        account.paymentBehaviorScore * weights.paymentBehaviorScore +
        account.relationshipScore * weights.relationshipScore;

      const roundedScore = Math.max(0, Math.min(100, Math.round(score)));

      return {
        accountId: account.accountId,
        accountName: account.accountName,
        score: roundedScore,
        trafficLight: this.getTrafficLight(roundedScore),
      };
    });

    return {
      generatedAt: new Date().toISOString(),
      totalAccounts: scoredAccounts.length,
      accounts: scoredAccounts,
    };
  }

  buildNpsCsatAutomationPlan(request: SurveyAutomationRequest) {
    const cooldownDays = request.cooldownDays ?? 30;
    const eventTemplateByType: Record<SurveyTriggerInput['eventType'], string> = {
      onboarding_completed: 'nps_onboarding_template',
      ticket_closed: 'csat_support_template',
      qbr_completed: 'nps_qbr_template',
      renewal_completed: 'nps_renewal_template',
    };

    const scheduled = request.triggers.map((trigger) => {
      const eventDate = new Date(trigger.eventDate);
      const sendDate = new Date(eventDate);
      sendDate.setDate(sendDate.getDate() + 1);

      const cooldownEndsAt = new Date(sendDate);
      cooldownEndsAt.setDate(cooldownEndsAt.getDate() + cooldownDays);

      return {
        accountId: trigger.accountId,
        surveyType:
          trigger.eventType === 'ticket_closed' ? 'CSAT' : 'NPS',
        preferredChannel: trigger.preferredChannel,
        template: eventTemplateByType[trigger.eventType],
        sendDate: sendDate.toISOString(),
        cooldownEndsAt: cooldownEndsAt.toISOString(),
      };
    });

    return {
      totalSurveysScheduled: scheduled.length,
      scheduled,
    };
  }

  buildRenewalPlan(request: RenewalRequest) {
    const today = new Date();

    const renewalItems = request.contracts.map((contract) => {
      const renewalDate = new Date(contract.renewalDate);
      const daysUntilRenewal = Math.max(
        0,
        Math.floor(
          (renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );

      const alertMilestones = [90, 60, 30]
        .filter((milestone) => daysUntilRenewal >= milestone)
        .map((milestone) => ({
          milestoneDays: milestone,
          shouldTrigger: daysUntilRenewal <= milestone + 1,
        }));

      return {
        accountId: contract.accountId,
        contractId: contract.contractId,
        ownerId: contract.ownerId,
        mrr: contract.mrr,
        renewalDate: renewalDate.toISOString(),
        daysUntilRenewal,
        alertMilestones,
      };
    });

    return {
      totalContracts: renewalItems.length,
      renewalItems,
    };
  }
}
