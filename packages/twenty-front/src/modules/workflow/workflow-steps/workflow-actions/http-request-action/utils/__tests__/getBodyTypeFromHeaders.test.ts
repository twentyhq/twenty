import { BODY_TYPES } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { getBodyTypeFromHeaders } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/getBodyTypeFromHeaders';

describe('getBodyTypeFromHeaders', () => {
  describe('when headers is undefined or null', () => {
    it('should return null for undefined headers', () => {
      expect(getBodyTypeFromHeaders(undefined)).toBe(null);
    });

    it('should return null for empty headers object', () => {
      expect(getBodyTypeFromHeaders({})).toBe(null);
    });
  });

  describe('when content-type header is missing', () => {
    it('should return null when content-type is not present', () => {
      const headers = {
        authorization: 'Bearer token',
        accept: 'application/json',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(null);
    });
  });

  describe('when content-type header is present', () => {
    it('should return rawJson for application/json content-type', () => {
      const headers = {
        'content-type': 'application/json',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(BODY_TYPES.RAW_JSON);
    });

    it('should return formData for multipart/form-data content-type', () => {
      const headers = {
        'content-type': 'multipart/form-data',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(BODY_TYPES.FORM_DATA);
    });

    it('should return keyValue for application/x-www-form-urlencoded content-type', () => {
      const headers = {
        'content-type': 'application/x-www-form-urlencoded',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(BODY_TYPES.KEY_VALUE);
    });

    it('should return text for text/plain content-type', () => {
      const headers = {
        'content-type': 'text/plain',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(BODY_TYPES.TEXT);
    });

    it('should return null for empty string content-type (none)', () => {
      const headers = {
        'content-type': '',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(null);
    });

    it('should return null for unrecognized content-type', () => {
      const headers = {
        'content-type': 'application/xml',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(null);
    });

    it('should return null for invalid content-type', () => {
      const headers = {
        'content-type': 'invalid/content-type',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(null);
    });
  });

  describe('case sensitivity', () => {
    it('should handle lowercase content-type header key', () => {
      const headers = {
        'content-type': 'application/json',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(BODY_TYPES.RAW_JSON);
    });

    it('should not match uppercase Content-Type header key', () => {
      const headers = {
        'Content-Type': 'application/json',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(null);
    });
  });

  describe('with multiple headers', () => {
    it('should correctly identify body type when other headers are present', () => {
      const headers = {
        authorization: 'Bearer token',
        'content-type': 'application/json',
        accept: 'application/json',
        'user-agent': 'Test Agent',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(BODY_TYPES.RAW_JSON);
    });
  });

  describe('edge cases', () => {
    it('should return null for content-type with charset parameter', () => {
      const headers = {
        'content-type': 'application/json; charset=utf-8',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(null);
    });

    it('should return null for content-type with boundary parameter', () => {
      const headers = {
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(null);
    });

    it('should return null for content-type with extra whitespace', () => {
      const headers = {
        'content-type': ' application/json ',
      };
      expect(getBodyTypeFromHeaders(headers)).toBe(null);
    });
  });
});
