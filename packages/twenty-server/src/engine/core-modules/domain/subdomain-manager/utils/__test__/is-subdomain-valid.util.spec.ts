import { isSubdomainValid } from 'src/engine/core-modules/domain/subdomain-manager/utils/is-subdomain-valid.util';

describe('isSubdomainValid', () => {
  describe('valid subdomains', () => {
    it('should accept valid alphanumeric subdomains', () => {
      expect(isSubdomainValid('abc')).toBe(true);
      expect(isSubdomainValid('test123')).toBe(true);
      expect(isSubdomainValid('company1')).toBe(true);
      expect(isSubdomainValid('workspace2024')).toBe(true);
    });

    it('should accept subdomains with hyphens in the middle', () => {
      expect(isSubdomainValid('my-company')).toBe(true);
      expect(isSubdomainValid('test-workspace')).toBe(true);
      expect(isSubdomainValid('multi-word-subdomain')).toBe(true);
      expect(isSubdomainValid('a-b-c-d-e')).toBe(true);
    });

    it('should accept subdomains with mixed alphanumeric and hyphens', () => {
      expect(isSubdomainValid('test-123')).toBe(true);
      expect(isSubdomainValid('company-2024')).toBe(true);
      expect(isSubdomainValid('workspace-v2')).toBe(true);
      expect(isSubdomainValid('my-app-123')).toBe(true);
    });

    it('should accept minimum length subdomains (3 characters)', () => {
      expect(isSubdomainValid('abc')).toBe(true);
      expect(isSubdomainValid('a1b')).toBe(true);
      expect(isSubdomainValid('x-y')).toBe(true);
    });

    it('should accept maximum length subdomains (30 characters)', () => {
      const maxLengthSubdomain = 'a'.repeat(28) + 'bc'; // 30 characters total

      expect(isSubdomainValid(maxLengthSubdomain)).toBe(true);

      const maxLengthWithHyphens = 'a' + '-'.repeat(28) + 'b'; // 30 characters with hyphens

      expect(isSubdomainValid(maxLengthWithHyphens)).toBe(true);
    });

    it('should accept subdomains starting and ending with alphanumeric characters', () => {
      expect(isSubdomainValid('a-b')).toBe(true);
      expect(isSubdomainValid('1-test-2')).toBe(true);
      expect(isSubdomainValid('start-middle-end')).toBe(true);
    });
  });

  describe('invalid subdomain patterns', () => {
    it('should reject empty strings', () => {
      expect(isSubdomainValid('')).toBe(false);
    });

    it('should reject subdomains that are too short (less than 3 characters)', () => {
      expect(isSubdomainValid('a')).toBe(false);
      expect(isSubdomainValid('ab')).toBe(false);
      expect(isSubdomainValid('1')).toBe(false);
      expect(isSubdomainValid('12')).toBe(false);
    });

    it('should reject subdomains that are too long (more than 30 characters)', () => {
      const tooLongSubdomain = 'a'.repeat(31);

      expect(isSubdomainValid(tooLongSubdomain)).toBe(false);

      const wayTooLongSubdomain = 'a'.repeat(50);

      expect(isSubdomainValid(wayTooLongSubdomain)).toBe(false);
    });

    it('should reject subdomains starting with hyphens', () => {
      expect(isSubdomainValid('-test')).toBe(false);
      expect(isSubdomainValid('-abc')).toBe(false);
      expect(isSubdomainValid('-my-company')).toBe(false);
    });

    it('should reject subdomains ending with hyphens', () => {
      expect(isSubdomainValid('test-')).toBe(false);
      expect(isSubdomainValid('abc-')).toBe(false);
      expect(isSubdomainValid('my-company-')).toBe(false);
    });

    it('should reject subdomains with uppercase letters', () => {
      expect(isSubdomainValid('Test')).toBe(false);
      expect(isSubdomainValid('MyCompany')).toBe(false);
      expect(isSubdomainValid('WORKSPACE')).toBe(false);
      expect(isSubdomainValid('test-Company')).toBe(false);
    });

    it('should reject subdomains with special characters', () => {
      expect(isSubdomainValid('test@company')).toBe(false);
      expect(isSubdomainValid('my_workspace')).toBe(false);
      expect(isSubdomainValid('test.company')).toBe(false);
      expect(isSubdomainValid('workspace#1')).toBe(false);
      expect(isSubdomainValid('test$company')).toBe(false);
      expect(isSubdomainValid('my%workspace')).toBe(false);
      expect(isSubdomainValid('test&company')).toBe(false);
      expect(isSubdomainValid('workspace*1')).toBe(false);
      expect(isSubdomainValid('test+company')).toBe(false);
      expect(isSubdomainValid('my=workspace')).toBe(false);
    });

    it('should reject subdomains with spaces', () => {
      expect(isSubdomainValid('test company')).toBe(false);
      expect(isSubdomainValid('my workspace')).toBe(false);
      expect(isSubdomainValid(' test')).toBe(false);
      expect(isSubdomainValid('test ')).toBe(false);
      expect(isSubdomainValid(' ')).toBe(false);
    });

    it('should reject subdomains starting with "api-"', () => {
      expect(isSubdomainValid('api-test')).toBe(false);
      expect(isSubdomainValid('api-company')).toBe(false);
      expect(isSubdomainValid('api-workspace')).toBe(false);
      expect(isSubdomainValid('api-123')).toBe(false);
    });

    it('should reject subdomains with only hyphens', () => {
      expect(isSubdomainValid('---')).toBe(false);
      expect(isSubdomainValid('----')).toBe(false);
    });

    it('should reject subdomains with numbers only at boundaries but invalid patterns', () => {
      expect(isSubdomainValid('1-')).toBe(false);
      expect(isSubdomainValid('-1')).toBe(false);
    });
  });

  describe('reserved subdomains', () => {
    it('should reject common reserved subdomains', () => {
      expect(isSubdomainValid('api')).toBe(false);
      expect(isSubdomainValid('www')).toBe(false);
      expect(isSubdomainValid('admin')).toBe(false);
      expect(isSubdomainValid('dashboard')).toBe(false);
      expect(isSubdomainValid('billing')).toBe(false);
      expect(isSubdomainValid('support')).toBe(false);
    });

    it('should reject technical reserved subdomains', () => {
      expect(isSubdomainValid('db')).toBe(false);
      expect(isSubdomainValid('cdn')).toBe(false);
      expect(isSubdomainValid('storage')).toBe(false);
      expect(isSubdomainValid('files')).toBe(false);
      expect(isSubdomainValid('media')).toBe(false);
      expect(isSubdomainValid('assets')).toBe(false);
    });

    it('should reject authentication related reserved subdomains', () => {
      expect(isSubdomainValid('auth')).toBe(false);
      expect(isSubdomainValid('login')).toBe(false);
      expect(isSubdomainValid('signin')).toBe(false);
      expect(isSubdomainValid('signup')).toBe(false);
      expect(isSubdomainValid('register')).toBe(false);
    });

    it('should reject business related reserved subdomains', () => {
      expect(isSubdomainValid('about')).toBe(false);
      expect(isSubdomainValid('contact')).toBe(false);
      expect(isSubdomainValid('careers')).toBe(false);
      expect(isSubdomainValid('jobs')).toBe(false);
      expect(isSubdomainValid('blog')).toBe(false);
      expect(isSubdomainValid('news')).toBe(false);
    });

    it('should reject country code reserved subdomains', () => {
      expect(isSubdomainValid('us')).toBe(false);
      expect(isSubdomainValid('uk')).toBe(false);
      expect(isSubdomainValid('ca')).toBe(false);
      expect(isSubdomainValid('au')).toBe(false);
      expect(isSubdomainValid('de')).toBe(false);
      expect(isSubdomainValid('fr')).toBe(false);
      expect(isSubdomainValid('it')).toBe(false);
      expect(isSubdomainValid('es')).toBe(false);
    });

    it('should reject geographic reserved subdomains', () => {
      expect(isSubdomainValid('europe')).toBe(false);
      expect(isSubdomainValid('asia')).toBe(false);
      expect(isSubdomainValid('africa')).toBe(false);
      expect(isSubdomainValid('america')).toBe(false);
      expect(isSubdomainValid('oceania')).toBe(false);
      expect(isSubdomainValid('paris')).toBe(false);
      expect(isSubdomainValid('london')).toBe(false);
      expect(isSubdomainValid('new-york')).toBe(false);
    });

    it('should reject environment related reserved subdomains', () => {
      expect(isSubdomainValid('dev')).toBe(false);
      expect(isSubdomainValid('test')).toBe(false);
      expect(isSubdomainValid('testing')).toBe(false);
      expect(isSubdomainValid('staging')).toBe(false);
      expect(isSubdomainValid('production')).toBe(false);
    });

    it('should reject reserved subdomains case-insensitively', () => {
      expect(isSubdomainValid('API')).toBe(false);
      expect(isSubdomainValid('Api')).toBe(false);
      expect(isSubdomainValid('WWW')).toBe(false);
      expect(isSubdomainValid('Www')).toBe(false);
      expect(isSubdomainValid('ADMIN')).toBe(false);
      expect(isSubdomainValid('Admin')).toBe(false);
      expect(isSubdomainValid('TEST')).toBe(false);
      expect(isSubdomainValid('Test')).toBe(false);
    });

    it('should reject all reserved subdomains from the constant', () => {
      const reservedSubdomains = [
        'trust',
        'demo',
        'api',
        't',
        'companies',
        'telemetry',
        'logs',
        'metrics',
        'next',
        'main',
        'admin',
        'dashboard',
        'dash',
        'billing',
        'db',
        'favicon',
        'www',
        'mail',
        'docs',
        'dev',
        'app',
        'staging',
        'production',
        'developer',
        'files',
        'cdn',
        'storage',
        'about',
        'help',
        'support',
        'contact',
        'privacy',
        'terms',
        'careers',
        'jobs',
        'blog',
        'news',
        'events',
        'community',
        'forum',
        'chat',
        'test',
        'testing',
        'feedback',
        'config',
        'settings',
        'media',
        'image',
        'audio',
        'video',
        'images',
        'partners',
        'partnership',
        'partnerships',
        'assets',
        'login',
        'signin',
        'signup',
        'legal',
        'shop',
        'merch',
        'store',
        'auth',
        'register',
        'payment',
      ];

      reservedSubdomains.forEach((subdomain) => {
        expect(isSubdomainValid(subdomain)).toBe(false);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace-only strings', () => {
      expect(isSubdomainValid('   ')).toBe(false);
      expect(isSubdomainValid('\t')).toBe(false);
      expect(isSubdomainValid('\n')).toBe(false);
      expect(isSubdomainValid('\r')).toBe(false);
    });

    it('should handle strings with leading/trailing whitespace', () => {
      expect(isSubdomainValid(' test')).toBe(false);
      expect(isSubdomainValid('test ')).toBe(false);
      expect(isSubdomainValid(' test ')).toBe(false);
      expect(isSubdomainValid('\ttest\t')).toBe(false);
    });

    it('should handle boundary length cases precisely', () => {
      // Exactly 3 characters (minimum valid)
      expect(isSubdomainValid('abc')).toBe(true);

      // Exactly 30 characters (maximum valid)
      const exactly30Chars = 'a'.repeat(28) + 'bc';

      expect(exactly30Chars.length).toBe(30);
      expect(isSubdomainValid(exactly30Chars)).toBe(true);

      // Exactly 31 characters (first invalid length)
      const exactly31Chars = 'a'.repeat(29) + 'bc';

      expect(exactly31Chars.length).toBe(31);
      expect(isSubdomainValid(exactly31Chars)).toBe(false);
    });

    it('should validate that reserved subdomains check is case insensitive', () => {
      // Test mixed case variations of reserved subdomains
      expect(isSubdomainValid('Trust')).toBe(false);
      expect(isSubdomainValid('TRUST')).toBe(false);
      expect(isSubdomainValid('tRuSt')).toBe(false);
      expect(isSubdomainValid('Demo')).toBe(false);
      expect(isSubdomainValid('DEMO')).toBe(false);
      expect(isSubdomainValid('dEmO')).toBe(false);
    });

    it('should accept valid subdomains that are similar to reserved ones but not exact matches', () => {
      // 'testing' is reserved, but 'testing123' is not
      expect(isSubdomainValid('testing123')).toBe(true);
      // 'api' is reserved, but 'myapi' is not
      expect(isSubdomainValid('myapi')).toBe(true);
      // 'admin' is reserved, but 'adminpanel' is not
      expect(isSubdomainValid('adminpanel')).toBe(true);
      // 'test' is reserved, but 'testapp' is not
      expect(isSubdomainValid('testapp')).toBe(true);
    });

    it('should handle Unicode characters', () => {
      expect(isSubdomainValid('tëst')).toBe(false);
      expect(isSubdomainValid('tést')).toBe(false);
      expect(isSubdomainValid('tèst')).toBe(false);
      expect(isSubdomainValid('café')).toBe(false);
      expect(isSubdomainValid('naïve')).toBe(false);
    });

    it('should handle numeric strings', () => {
      expect(isSubdomainValid('123')).toBe(true);
      expect(isSubdomainValid('456789')).toBe(true);
      expect(isSubdomainValid('1-2-3')).toBe(true);
    });
  });

  describe('pattern validation specifics', () => {
    it('should enforce the exact regex pattern requirements', () => {
      // Test that the pattern requires alphanumeric start and end
      expect(isSubdomainValid('a-b')).toBe(true);
      expect(isSubdomainValid('1-2')).toBe(true);
      expect(isSubdomainValid('test-123')).toBe(true);

      // Test that it rejects patterns not matching the regex
      expect(isSubdomainValid('-ab')).toBe(false);
      expect(isSubdomainValid('ab-')).toBe(false);
    });

    it('should reject api- prefix specifically', () => {
      expect(isSubdomainValid('api-anything')).toBe(false);
      expect(isSubdomainValid('api-test')).toBe(false);
      expect(isSubdomainValid('api-123')).toBe(false);

      // But allow 'api' in other positions
      expect(isSubdomainValid('myapi')).toBe(true);
    });

    it('should validate length constraints from regex', () => {
      // The regex pattern is: /^(?!api-).*^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/
      // This means: start char + 1-28 middle chars + end char = 3-30 total chars

      // 3 chars: start + 1 middle + end
      expect(isSubdomainValid('abc')).toBe(true);

      // 30 chars: start + 28 middle + end
      const thirtyChars = 'a' + 'b'.repeat(28) + 'c';

      expect(thirtyChars.length).toBe(30);
      expect(isSubdomainValid(thirtyChars)).toBe(true);
    });
  });
});
