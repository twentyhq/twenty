import { AWS_SES_MAIL_FROM_CANDIDATE_COUNT } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-mail-from-candidate-count.constant';
import { AWS_SES_MAIL_FROM_SUBDOMAIN } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-mail-from-subdomain.constant';

export const buildAwsSesMailFromDomainCandidates = (domain: string): string[] =>
  Array.from({ length: AWS_SES_MAIL_FROM_CANDIDATE_COUNT }, (_, index) =>
    index === 0
      ? `${AWS_SES_MAIL_FROM_SUBDOMAIN}.${domain}`
      : `${AWS_SES_MAIL_FROM_SUBDOMAIN}${index + 1}.${domain}`,
  );
