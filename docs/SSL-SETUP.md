# SSL/HTTPS Setup for Twenty CRM

## Overview
Twenty CRM is configured with HTTPS using self-signed SSL certificates and Nginx reverse proxy.

## Access URLs
- **HTTPS (recommended):** https://localhost:3443
- **HTTP (redirects to HTTPS):** http://localhost:3080

## Browser Warning
You'll see a security warning because the certificate is self-signed. This is normal for local development.

**To bypass:**
1. Click "Advanced" or "Show Details"
2. Click "Proceed to localhost" or "Accept Risk"

## Certificate Details
- **Location:** `nginx/ssl/`
- **Validity:** 365 days from generation date
- **Algorithm:** RSA 2048-bit

## Regenerate Certificate
```bash
./nginx/ssl/generate-certs.sh
docker compose restart nginx
```

## Production Certificates
For production, use Let's Encrypt:
```bash
# Install certbot
# Configure domain DNS
# Generate certificate
certbot certonly --standalone -d yourdomain.com
# Update nginx.conf to point to certbot certificates
```

## Troubleshooting
- **Connection refused:** Check Nginx is running: `docker compose ps nginx`
- **Certificate error:** Regenerate certificates
- **Redirect loop:** Check SERVER_URL in .env matches HTTPS
