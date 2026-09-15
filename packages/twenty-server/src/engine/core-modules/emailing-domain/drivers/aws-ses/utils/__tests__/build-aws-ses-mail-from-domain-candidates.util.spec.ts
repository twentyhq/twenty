import { buildAwsSesMailFromDomainCandidates } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/utils/build-aws-ses-mail-from-domain-candidates.util';

describe('buildAwsSesMailFromDomainCandidates', () => {
  it('should try the Twenty bounce subdomain first, then numbered fallbacks', () => {
    expect(buildAwsSesMailFromDomainCandidates('faz.de')).toEqual([
      'twenty-bounce.faz.de',
      'twenty-bounce2.faz.de',
      'twenty-bounce3.faz.de',
      'twenty-bounce4.faz.de',
      'twenty-bounce5.faz.de',
    ]);
  });
});
