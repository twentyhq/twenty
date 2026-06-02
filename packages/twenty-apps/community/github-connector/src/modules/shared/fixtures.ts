export function isFixtureAllowed(): boolean {
  return process.env.NODE_ENV !== 'production';
}
