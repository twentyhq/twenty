import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

/**
 * Simplified encryption utility for TOTP secrets.
 * This replaces the complex KeyWrappingService for TOTP use cases
 * to avoid encoding issues and reduce complexity.
 */
@Injectable()
export class SimpleSecretEncryptionUtil {
  private readonly algorithm = 'aes-256-cbc';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits

  constructor(private readonly jwtWrapperService: JwtWrapperService) {}

  /**
   * Encrypts a TOTP secret string
   */
  async encryptSecret(
    secret: string,
    purpose: string,
  ): Promise<string> {
    const appSecret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.KEY_ENCRYPTION_KEY,
      purpose,
    );

    // Derive a proper encryption key from the app secret
    const encryptionKey = createHash('sha256')
      .update(appSecret)
      .digest()
      .slice(0, this.keyLength);

    // Generate a random IV for each encryption
    const iv = randomBytes(this.ivLength);
    
    const cipher = createCipheriv(this.algorithm, encryptionKey, iv);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Prepend the IV to the encrypted data
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypts a TOTP secret string
   */
  async decryptSecret(
    encryptedSecret: string,
    purpose: string,
  ): Promise<string> {
    const appSecret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.KEY_ENCRYPTION_KEY,
      purpose,
    );

    // Derive the same encryption key from the app secret
    const encryptionKey = createHash('sha256')
      .update(appSecret)
      .digest()
      .slice(0, this.keyLength);

    // Extract the IV and encrypted data
    const [ivHex, encryptedData] = encryptedSecret.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = createDecipheriv(this.algorithm, encryptionKey, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
} 