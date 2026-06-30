// Everyone uses the cloud by default; covering Hosting & Infrastructure also
// signals self-host capability. Derived server-side on application creation.
export type PartnerDeployment = 'CLOUD' | 'SELF_HOST';

export function deriveDeploymentExpertise(
  partnerScope: ReadonlyArray<string> | undefined | null,
): PartnerDeployment[] {
  const result: PartnerDeployment[] = ['CLOUD'];
  if (partnerScope?.includes('HOSTING')) result.push('SELF_HOST');
  return result;
}
