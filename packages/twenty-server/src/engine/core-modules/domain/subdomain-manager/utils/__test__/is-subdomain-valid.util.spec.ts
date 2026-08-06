import { isSubdomainValid } from 'src/engine/core-modules/domain/subdomain-manager/utils/is-subdomain-valid.util';

describe('isSubdomainValid', () => {
  describe('valid subdomains', () => {
    it('should accept valid alphanumeric subdomains', () => {
      expect(isSubdomainValid({ subdomain: 'abc' })).toBe(true);
      expect(isSubdomainValid({ subdomain: 'test123' })).toBe(true);
      expect(isSubdomainValid({ subdomain: 'company1' })).toBe(true);
      expect(isSubdomainValid({ subdomain: 'workspace2024' })).toBe(true);
    });

    it('should accept subdomains with hyphens in the middle', () => {
      expect(isSubdomainValid({ subdomain: 'my-company' })).toBe(true);
      expect(isSubdomainValid({ subdomain: 'test-workspace' })).toBe(true);
      expect(isSubdomainValid({ subdomain: 'multi-word-subdomain' })).toBe(
        true,
      );
      expect(isSubdomainValid({ subdomain: 'a-b-c-d-e' })).toBe(true);
    });

    it('should accept subdomains with mixed alphanumeric and hyphens', () => {
      expect(isSubdomainValid({ subdomain: 'test-123' })).toBe(true);
      expect(isSubdomainValid({ subdomain: 'company-2024' })).toBe(true);
      expect(isSubdomainValid({ subdomain: 'workspace-v2' })).toBe(true);
      expect(isSubdomainValid({ subdomain: 'my-app-123' })).toBe(true);
    });

    it('should accept minimum length subdomains (3 characters)', () => {
      expect(isSubdomainValid({ subdomain: 'abc' })).toBe(true);
      expect(isSubdomainValid({ subdomain: 'a1b' })).toBe(true);
      expect(isSubdomainValid({ subdomain: 'x-y' })).toBe(true);
    });

    it('should accept maximum length subdomains (30 characters)', () => {
      const maxLengthSubdomain = 'a'.repeat(28) + 'bc'; // 30 characters total

      expect(isSubdomainValid({ subdomain: maxLengthSubdomain })).toBe(true);

      const maxLengthWithHyphens = 'a' + '-'.repeat(28) + 'b'; // 30 characters with hyphens

      expect(isSubdomainValid({ subdomain: maxLengthWithHyphens })).toBe(true);
    });

    it('should accept subdomains starting and ending with alphanumeric characters', () => {
      expect(isSubdomainValid({ subdomain: 'a-b' })).toBe(true);
      expect(isSubdomainValid({ subdomain: '1-test-2' })).toBe(true);
      expect(isSubdomainValid({ subdomain: 'start-middle-end' })).toBe(true);
    });
  });

  describe('invalid subdomain patterns', () => {
    it('should reject empty strings', () => {
      expect(isSubdomainValid({ subdomain: '' })).toBe(false);
    });

    it('should reject subdomains that are too short (less than 3 characters)', () => {
      expect(isSubdomainValid({ subdomain: 'a' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'ab' })).toBe(false);
      expect(isSubdomainValid({ subdomain: '1' })).toBe(false);
      expect(isSubdomainValid({ subdomain: '12' })).toBe(false);
    });

    it('should reject subdomains that are too long (more than 30 characters)', () => {
      const tooLongSubdomain = 'a'.repeat(31);

      expect(isSubdomainValid({ subdomain: tooLongSubdomain })).toBe(false);

      const wayTooLongSubdomain = 'a'.repeat(50);

      expect(isSubdomainValid({ subdomain: wayTooLongSubdomain })).toBe(false);
    });

    it('should reject subdomains starting with hyphens', () => {
      expect(isSubdomainValid({ subdomain: '-test' })).toBe(false);
      expect(isSubdomainValid({ subdomain: '-abc' })).toBe(false);
      expect(isSubdomainValid({ subdomain: '-my-company' })).toBe(false);
    });

    it('should reject subdomains ending with hyphens', () => {
      expect(isSubdomainValid({ subdomain: 'test-' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'abc-' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'my-company-' })).toBe(false);
    });

    it('should reject subdomains with uppercase letters', () => {
      expect(isSubdomainValid({ subdomain: 'Test' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'MyCompany' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'WORKSPACE' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'test-Company' })).toBe(false);
    });

    it('should reject subdomains with special characters', () => {
      expect(isSubdomainValid({ subdomain: 'test@company' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'my_workspace' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'test.company' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'workspace#1' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'test$company' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'my%workspace' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'test&company' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'workspace*1' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'test+company' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'my=workspace' })).toBe(false);
    });

    it('should reject subdomains with spaces', () => {
      expect(isSubdomainValid({ subdomain: 'test company' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'my workspace' })).toBe(false);
      expect(isSubdomainValid({ subdomain: ' test' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'test ' })).toBe(false);
      expect(isSubdomainValid({ subdomain: ' ' })).toBe(false);
    });

    it('should reject subdomains starting with "api-"', () => {
      expect(isSubdomainValid({ subdomain: 'api-test' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'api-company' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'api-workspace' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'api-123' })).toBe(false);
    });

    it('should reject subdomains with only hyphens', () => {
      expect(isSubdomainValid({ subdomain: '---' })).toBe(false);
      expect(isSubdomainValid({ subdomain: '----' })).toBe(false);
    });

    it('should reject subdomains with numbers only at boundaries but invalid patterns', () => {
      expect(isSubdomainValid({ subdomain: '1-' })).toBe(false);
      expect(isSubdomainValid({ subdomain: '-1' })).toBe(false);
    });
  });

  describe('configurable minimum length', () => {
    it('should accept subdomains shorter than 3 when a lower minimum is provided', () => {
      expect(isSubdomainValid({ subdomain: 'ab', minLength: 2 })).toBe(true);
      expect(isSubdomainValid({ subdomain: 'xy', minLength: 1 })).toBe(true);
    });

    it('should still reject subdomains shorter than the provided minimum', () => {
      expect(isSubdomainValid({ subdomain: 'ab', minLength: 3 })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'abcd', minLength: 5 })).toBe(false);
    });

    it('should reject reserved subdomains even when a lower minimum is provided', () => {
      expect(isSubdomainValid({ subdomain: 'us', minLength: 2 })).toBe(false);
    });
  });

  describe('reserved subdomains', () => {
    it('should reject common reserved subdomains', () => {
      expect(isSubdomainValid({ subdomain: 'api' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'www' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'admin' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'dashboard' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'billing' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'support' })).toBe(false);
    });

    it('should reject technical reserved subdomains', () => {
      expect(isSubdomainValid({ subdomain: 'db' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'cdn' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'storage' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'files' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'media' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'assets' })).toBe(false);
    });

    it('should reject authentication related reserved subdomains', () => {
      expect(isSubdomainValid({ subdomain: 'auth' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'login' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'signin' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'signup' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'register' })).toBe(false);
    });

    it('should reject business related reserved subdomains', () => {
      expect(isSubdomainValid({ subdomain: 'about' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'contact' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'careers' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'jobs' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'blog' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'news' })).toBe(false);
    });

    it('should reject country code reserved subdomains', () => {
      expect(isSubdomainValid({ subdomain: 'us' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'uk' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'ca' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'au' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'de' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'fr' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'it' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'es' })).toBe(false);
    });

    it('should reject geographic reserved subdomains', () => {
      expect(isSubdomainValid({ subdomain: 'europe' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'asia' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'africa' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'america' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'oceania' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'paris' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'london' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'new-york' })).toBe(false);
    });

    it('should reject environment related reserved subdomains', () => {
      expect(isSubdomainValid({ subdomain: 'dev' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'test' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'testing' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'staging' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'production' })).toBe(false);
    });

    it('should reject reserved subdomains case-insensitively', () => {
      expect(isSubdomainValid({ subdomain: 'API' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'Api' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'WWW' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'Www' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'ADMIN' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'Admin' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'TEST' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'Test' })).toBe(false);
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
        expect(isSubdomainValid({ subdomain: subdomain })).toBe(false);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace-only strings', () => {
      expect(isSubdomainValid({ subdomain: '   ' })).toBe(false);
      expect(isSubdomainValid({ subdomain: '\t' })).toBe(false);
      expect(isSubdomainValid({ subdomain: '\n' })).toBe(false);
      expect(isSubdomainValid({ subdomain: '\r' })).toBe(false);
    });

    it('should handle strings with leading/trailing whitespace', () => {
      expect(isSubdomainValid({ subdomain: ' test' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'test ' })).toBe(false);
      expect(isSubdomainValid({ subdomain: ' test ' })).toBe(false);
      expect(isSubdomainValid({ subdomain: '\ttest\t' })).toBe(false);
    });

    it('should handle boundary length cases precisely', () => {
      // Exactly 3 characters (minimum valid)
      expect(isSubdomainValid({ subdomain: 'abc' })).toBe(true);

      // Exactly 30 characters (maximum valid)
      const exactly30Chars = 'a'.repeat(28) + 'bc';

      expect(exactly30Chars.length).toBe(30);
      expect(isSubdomainValid({ subdomain: exactly30Chars })).toBe(true);

      // Exactly 31 characters (first invalid length)
      const exactly31Chars = 'a'.repeat(29) + 'bc';

      expect(exactly31Chars.length).toBe(31);
      expect(isSubdomainValid({ subdomain: exactly31Chars })).toBe(false);
    });

    it('should validate that reserved subdomains check is case insensitive', () => {
      // Test mixed case variations of reserved subdomains
      expect(isSubdomainValid({ subdomain: 'Trust' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'TRUST' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'tRuSt' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'Demo' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'DEMO' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'dEmO' })).toBe(false);
    });

    it('should accept valid subdomains that are similar to reserved ones but not exact matches', () => {
      // 'testing' is reserved, but 'testing123' is not
      expect(isSubdomainValid({ subdomain: 'testing123' })).toBe(true);
      // 'api' is reserved, but 'myapi' is not
      expect(isSubdomainValid({ subdomain: 'myapi' })).toBe(true);
      // 'admin' is reserved, but 'adminpanel' is not
      expect(isSubdomainValid({ subdomain: 'adminpanel' })).toBe(true);
      // 'test' is reserved, but 'testapp' is not
      expect(isSubdomainValid({ subdomain: 'testapp' })).toBe(true);
    });

    it('should handle Unicode characters', () => {
      expect(isSubdomainValid({ subdomain: 'tëst' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'tést' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'tèst' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'café' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'naïve' })).toBe(false);
    });

    it('should handle numeric strings', () => {
      expect(isSubdomainValid({ subdomain: '123' })).toBe(true);
      expect(isSubdomainValid({ subdomain: '456789' })).toBe(true);
      expect(isSubdomainValid({ subdomain: '1-2-3' })).toBe(true);
    });
  });

  describe('pattern validation specifics', () => {
    it('should enforce the exact regex pattern requirements', () => {
      // Test that the pattern requires alphanumeric start and end
      expect(isSubdomainValid({ subdomain: 'a-b' })).toBe(true);
      expect(isSubdomainValid({ subdomain: '1-2' })).toBe(true);
      expect(isSubdomainValid({ subdomain: 'test-123' })).toBe(true);

      // Test that it rejects patterns not matching the regex
      expect(isSubdomainValid({ subdomain: '-ab' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'ab-' })).toBe(false);
    });

    it('should reject api- prefix specifically', () => {
      expect(isSubdomainValid({ subdomain: 'api-anything' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'api-test' })).toBe(false);
      expect(isSubdomainValid({ subdomain: 'api-123' })).toBe(false);

      // But allow 'api' in other positions
      expect(isSubdomainValid({ subdomain: 'myapi' })).toBe(true);
    });

    it('should validate length constraints from regex', () => {
      // The regex pattern is: /^(?!api-).*^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/
      // This means: start char + 1-28 middle chars + end char = 3-30 total chars

      // 3 chars: start + 1 middle + end
      expect(isSubdomainValid({ subdomain: 'abc' })).toBe(true);

      // 30 chars: start + 28 middle + end
      const thirtyChars = 'a' + 'b'.repeat(28) + 'c';

      expect(thirtyChars.length).toBe(30);
      expect(isSubdomainValid({ subdomain: thirtyChars })).toBe(true);
    });
  });
});
