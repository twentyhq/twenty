# FlightControl Deployment TODOs

## High Priority: Fix SSL Certificate Verification

**Status:** Currently disabled with `NODE_TLS_REJECT_UNAUTHORIZED=0`
**Risk:** Man-in-the-middle attack vulnerability (low within AWS VPC, but not production-ready)
**Current behavior:** Connection is encrypted but certificates are not verified

### How to Fix

#### 1. Download AWS RDS CA Bundle to Docker Image

Edit `packages/twenty-docker/twenty/Dockerfile` and add these lines after line 54 (before the entrypoint copy):

```dockerfile
# Download AWS RDS CA certificates for SSL verification
RUN apk add --no-cache ca-certificates && \
    wget -O /tmp/global-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem && \
    mkdir -p /app/certs && \
    mv /tmp/global-bundle.pem /app/certs/rds-ca-bundle.pem && \
    chown -R 1000:1000 /app/certs
```

#### 2. Configure TypeORM to Use CA Bundle

The application needs to be configured to use the CA bundle. Check if there's a TypeORM datasource configuration that accepts SSL options. You may need to:

- Add environment variable: `PGSSLROOTCERT=/app/certs/rds-ca-bundle.pem`
- Or modify the TypeORM connection configuration to include:
  ```typescript
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/app/certs/rds-ca-bundle.pem').toString()
  }
  ```

#### 3. Update FlightControl Configuration

Edit `flightcontrol.json` and update both services:

**Remove:**
```json
"NODE_TLS_REJECT_UNAUTHORIZED": "0"
```

**Add:**
```json
"PGSSLROOTCERT": "/app/certs/rds-ca-bundle.pem"
```

Or set `PGSSLMODE` to `verify-ca` or `verify-full` if the application's TypeORM configuration supports reading from `PGSSLROOTCERT`.

#### 4. Update psql Commands in Entrypoint

Edit `packages/twenty-docker/twenty/entrypoint.sh` to use the CA bundle for psql commands:

Add `PGSSLROOTCERT=/app/certs/rds-ca-bundle.pem` to the environment when running psql commands, or modify the psql calls to include:
```bash
PGSSLROOTCERT=/app/certs/rds-ca-bundle.pem psql ...
```

### Testing

After making these changes:
1. Build and deploy to FlightControl
2. Verify the warning no longer appears in logs
3. Confirm database connections still work
4. Check that migrations run successfully

### References

- [AWS RDS SSL/TLS Certificates](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html)
- [PostgreSQL SSL Support](https://www.postgresql.org/docs/current/libpq-ssl.html)
- [TypeORM SSL Configuration](https://typeorm.io/data-source-options#postgres--cockroachdb-data-source-options)

---

## Other TODOs

### Performance & Scaling
- [ ] Review CPU and memory allocations for services (currently 0.5 CPU / 1GB memory)
- [ ] Consider enabling auto-scaling based on load metrics
- [ ] Evaluate RDS instance size (currently db.t4g.micro)

### Monitoring & Observability
- [ ] Set up CloudWatch alarms for service health
- [ ] Configure application logging aggregation
- [ ] Monitor database performance metrics

### Configuration
- [ ] Document all required environment variables in FlightControl dashboard
- [ ] Consider moving to Parameter Store or Secrets Manager for sensitive values
- [ ] Review and configure S3 storage settings (STORAGE_* variables)

### Optional Features
- [ ] Set up custom domain and SSL certificate
- [ ] Configure VPC for private networking
- [ ] Enable database backups and point-in-time recovery
- [ ] Set up staging environment
