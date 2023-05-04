import { mapUser } from './user.interface';

describe('mapUser', () => {
  it('should map person', () => {
    const user = mapUser({
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      email: 'test@test.fr',
      displayName: 'John Doe',
    });
    expect(user.id).toBe('7dfbc3f7-6e5e-4128-957e-8d86808cdf6b');
  });
});
