export const resolveClaimStateCookieSameSite = ({
  sameSite,
}: {
  sameSite: 'lax' | 'strict' | 'none';
}): 'lax' | 'none' => (sameSite === 'none' ? 'none' : 'lax');
