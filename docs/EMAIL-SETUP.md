# Email Configuration

## Overview
Twenty CRM uses SMTP for sending emails (notifications, password resets, invitations, etc.).

## Configuration

### Environment Variables
Located in `.env`:
- `EMAIL_FROM_ADDRESS` - Sender email address
- `EMAIL_FROM_NAME` - Sender display name
- `EMAIL_SMTP_HOST` - SMTP server hostname
- `EMAIL_SMTP_PORT` - SMTP port (usually 587 for TLS, 465 for SSL)
- `EMAIL_SMTP_USER` - SMTP username (usually your email)
- `EMAIL_SMTP_PASSWORD` - SMTP password or app password
- `EMAIL_SMTP_ENCRYPTION` - Encryption type (tls or ssl)

## Provider Setup

### Gmail

1. **Enable 2FA** on your Google account
2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and device
   - Copy the 16-character password
3. **Update .env:**
   ```bash
   EMAIL_SMTP_HOST=smtp.gmail.com
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=your-email@gmail.com
   EMAIL_SMTP_PASSWORD=your-16-char-app-password
   EMAIL_SMTP_ENCRYPTION=tls
   ```

### SendGrid

1. **Create account** at sendgrid.com
2. **Generate API key** (use as password)
3. **Update .env:**
   ```bash
   EMAIL_SMTP_HOST=smtp.sendgrid.net
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=apikey
   EMAIL_SMTP_PASSWORD=your-sendgrid-api-key
   EMAIL_SMTP_ENCRYPTION=tls
   ```

### Mailgun

1. **Create account** at mailgun.com
2. **Get SMTP credentials** from domain settings
3. **Update .env:**
   ```bash
   EMAIL_SMTP_HOST=smtp.mailgun.org
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=postmaster@your-domain.mailgun.org
   EMAIL_SMTP_PASSWORD=your-mailgun-password
   EMAIL_SMTP_ENCRYPTION=tls
   ```

### AWS SES

1. **Verify domain/email** in SES console
2. **Create SMTP credentials**
3. **Update .env:**
   ```bash
   EMAIL_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   EMAIL_SMTP_PORT=587
   EMAIL_SMTP_USER=your-ses-smtp-username
   EMAIL_SMTP_PASSWORD=your-ses-smtp-password
   EMAIL_SMTP_ENCRYPTION=tls
   ```

## Testing

### Test Connection
```bash
./scripts/test-email.sh
```

### Test Actual Email
1. Open Twenty CRM: https://localhost:3443
2. Go to forgot password
3. Enter your email
4. Check inbox for reset email

### Debug Email Issues
```bash
# Check server logs
docker compose logs server | grep -i email

# Test SMTP manually with openssl
openssl s_client -connect smtp.gmail.com:587 -starttls smtp
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Authentication failed | Check username/password, use app password for Gmail |
| Connection timeout | Check port (587 or 465), firewall settings |
| TLS/SSL error | Try different encryption (tls vs ssl) |
| Emails in spam | Configure SPF/DKIM records for your domain |
| Rate limiting | Use dedicated email service (SendGrid, Mailgun) |

## Security Best Practices

1. **Never commit credentials** - Use .env and add to .gitignore
2. **Use app passwords** - Don't use main account password
3. **Restrict sender** - Only send from verified domains
4. **Monitor usage** - Watch for unusual sending patterns
5. **Rotate credentials** - Change passwords periodically
